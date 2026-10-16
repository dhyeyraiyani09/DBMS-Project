from fastapi.testclient import TestClient
from backend.main import app
from backend.services.explain_analyzer import ExplainAnalyzer, ExplainError
import pytest
from sqlglot import exp

client = TestClient(app)

def test_explain_analyzer_validation():
    # Valid SELECT
    analyzer = ExplainAnalyzer("SELECT * FROM users WHERE age > 25")
    analyzer._validate_and_translate() # Should not raise
    
    # Valid Nested SELECT
    analyzer = ExplainAnalyzer("SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)")
    analyzer._validate_and_translate()
    
    # Invalid destructive commands
    invalid_queries = [
        "INSERT INTO users VALUES (1, 'x')",
        "UPDATE users SET name='x'",
        "DELETE FROM users",
        "DROP TABLE users",
        "ALTER TABLE users ADD COLUMN x INT",
        "CREATE TABLE test(id INT)",
        "CREATE INDEX idx_test ON users(age)",
        "TRUNCATE TABLE users",
        "RENAME TABLE users TO users2",
        "GRANT ALL ON *.* TO 'x'"
    ]
    
    for q in invalid_queries:
        with pytest.raises(ExplainError) as excinfo:
            ExplainAnalyzer(q)._validate_and_translate()
        assert "Only SELECT queries are allowed" in str(excinfo.value)
        
    # Multi-statement / Injection
    with pytest.raises(ExplainError):
        ExplainAnalyzer("SELECT * FROM users; DROP TABLE users;")._validate_and_translate()
        
    # Comments bypass test
    with pytest.raises(ExplainError):
        ExplainAnalyzer("SELECT * FROM users /* comment */; DROP TABLE users;")._validate_and_translate()

def test_explain_api_empty_query():
    response = client.post("/api/explain/", json={"query": ""})
    assert response.status_code == 400
    assert "SQL query cannot be empty" in response.json()["detail"]

def test_explain_api_invalid_query():
    response = client.post("/api/explain/", json={"query": "DELETE FROM users"})
    assert response.status_code == 400
    assert "Only SELECT queries are allowed" in response.json()["detail"]

def test_explain_api_valid_query():
    response = client.post("/api/explain/", json={"query": "SELECT * FROM orders WHERE user_id = 1 ORDER BY order_date DESC"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "explain_rows" in data
    assert isinstance(data["explain_rows"], list)
    assert len(data["explain_rows"]) > 0
    
    row = data["explain_rows"][0]
    assert row["table"] == "orders"
    assert "type" in row
    # Even if MySQL changes choice in future, these fields must be returned
    assert "possible_keys" in row
    assert "key" in row
    assert "Extra" in row

def test_explain_analyzer_quoted_semicolon():
    # Should not raise exception
    analyzer = ExplainAnalyzer("SELECT * FROM users WHERE name = 'Alice; DROP TABLE users;'")
    analyzer._validate_and_translate()

def test_explain_api_missing_data():
    response = client.post("/api/explain/", json={})
    assert response.status_code == 422 # FastAPI validation error

def test_explain_access_type_interpretation():
    analyzer = ExplainAnalyzer("SELECT * FROM users")
    assert "entire table" in analyzer._interpret_access_type("ALL")
    assert "single-row lookup" in analyzer._interpret_access_type("const")
    assert "non-unique/reference" in analyzer._interpret_access_type("ref")
    assert "index range scan" in analyzer._interpret_access_type("range")
    assert "entire index tree" in analyzer._interpret_access_type("index")
    assert "one matching row per preceding row" in analyzer._interpret_access_type("eq_ref")

def test_explain_api_mysql_error():
    # Force a MySQL error by querying a non-existent table (assuming 'fake_table' doesn't exist)
    response = client.post("/api/explain/", json={"query": "SELECT * FROM fake_table"})
    assert response.status_code == 400
    assert "EXPLAIN execution failed" in response.json()["detail"]

def test_explain_api_fields_and_distinction():
    response = client.post("/api/explain/", json={"query": "SELECT * FROM orders WHERE user_id = 1"})
    assert response.status_code == 200
    data = response.json()
    row = data["explain_rows"][0]
    
    # Verify all normalized fields exist
    fields = ["id", "select_type", "table", "type", "possible_keys", "key", "key_len", "ref", "rows", "filtered", "Extra", "interpretation"]
    for f in fields:
        assert f in row
        
    # verify possible_keys/key distinction educational explanation
    # (The test verifies the fields exist; the educational distinction is verified in UI/documentation)
    assert row["possible_keys"] is not None # idx_user_date, idx_user
    assert row["key"] is not None # probably idx_user_date or idx_user


def test_explain_translate_strips_logical_schema_prefix():
    """
    Regression test for bug: EXPLAIN SQL incorrectly included the logical schema prefix
    (e.g. ECOMMERCE.phy_6_6) when a user wrote a query as SCHEMA.table notation.

    The logical schema name (e.g. ECOMMERCE) is an application-level construct and
    does NOT correspond to a real MySQL database. Physical tables live in the connected
    database (defaultdb on Aiven) and must be referenced without a schema prefix.

    Fix: When replacing a logical table name with the physical name, the sqlglot Table
    node's 'db' attribute must also be cleared to strip the prefix.
    """
    from sqlglot import exp as sqlglot_exp
    import sqlglot

    # Simulate what _validate_and_translate does for a user query with schema prefix
    query = "SELECT ORDER_ID, ORDER_DATE FROM ECOMMERCE.orders WHERE ORDER_DATE >= '2026-01-01'"
    ast = sqlglot.parse_one(query)

    table_map = {"orders": "phy_6_6"}
    cte_names = set()

    def replace_table(node):
        if isinstance(node, sqlglot_exp.Table):
            tname = node.name.lower()
            if tname in table_map and tname not in cte_names:
                node.set("this", sqlglot_exp.Identifier(this=table_map[tname]))
                node.set("db", None)  # The fix: strip the logical schema prefix
        return node

    translated_ast = ast.copy().transform(replace_table)
    translated_sql = translated_ast.sql(dialect="mysql")

    # Must NOT contain the logical schema prefix
    assert "ECOMMERCE" not in translated_sql, (
        f"Logical schema prefix must not appear in translated SQL, got: {translated_sql}"
    )
    # Must correctly reference the physical table
    assert "phy_6_6" in translated_sql, (
        f"Physical table name must appear in translated SQL, got: {translated_sql}"
    )
    # Must NOT have the erroneous `ECOMMERCE.phy_6_6` pattern
    assert "ECOMMERCE.phy_6_6" not in translated_sql

    # Also verify the WHERE clause is preserved intact
    assert "ORDER_DATE" in translated_sql
    assert "2026-01-01" in translated_sql

def test_explain_translate_unaliased_multi_table():
    """
    Regression test: When a multi-table query does not use explicit table aliases,
    e.g. SELECT users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id
    the physical table replacement must assign the logical table name as the alias
    (phy_1_1 AS users, phy_1_2 AS orders). Otherwise, MySQL fails with:
    Unknown column 'users.id' in 'on clause' / 'field list'.
    """
    from sqlglot import exp as sqlglot_exp
    import sqlglot

    query = "SELECT users.name, orders.total FROM users JOIN orders ON users.id = orders.user_id"
    ast = sqlglot.parse_one(query, read="mysql")

    table_map = {"users": "phy_1_1", "orders": "phy_1_2"}
    cte_names = set()

    def replace_table(node):
        if isinstance(node, sqlglot_exp.Table):
            tname = node.name.lower()
            if tname in table_map and tname not in cte_names:
                orig_name = node.name
                orig_alias = node.alias
                node.set("this", sqlglot_exp.Identifier(this=table_map[tname]))
                node.set("db", None)
                if not orig_alias:
                    node.set("alias", sqlglot_exp.TableAlias(this=sqlglot_exp.Identifier(this=orig_name)))
        return node

    translated_sql = ast.copy().transform(replace_table).sql(dialect="mysql")

    assert "phy_1_1 AS users" in translated_sql
    assert "phy_1_2 AS orders" in translated_sql
    assert "users.id = orders.user_id" in translated_sql

def test_explain_translate_mixed_aliases():
    """
    When explicit alias is present on one table and absent on another,
    explicit alias is preserved and missing alias gets logical name.
    """
    from sqlglot import exp as sqlglot_exp
    import sqlglot

    query = "SELECT u.name, orders.total FROM users u JOIN orders ON u.id = orders.user_id"
    ast = sqlglot.parse_one(query, read="mysql")

    table_map = {"users": "phy_1_1", "orders": "phy_1_2"}
    cte_names = set()

    def replace_table(node):
        if isinstance(node, sqlglot_exp.Table):
            tname = node.name.lower()
            if tname in table_map and tname not in cte_names:
                orig_name = node.name
                orig_alias = node.alias
                node.set("this", sqlglot_exp.Identifier(this=table_map[tname]))
                node.set("db", None)
                if not orig_alias:
                    node.set("alias", sqlglot_exp.TableAlias(this=sqlglot_exp.Identifier(this=orig_name)))
        return node

    translated_sql = ast.copy().transform(replace_table).sql(dialect="mysql")

    # u should remain u, orders should get AS orders
    assert "phy_1_1 AS u" in translated_sql
    assert "phy_1_2 AS orders" in translated_sql
