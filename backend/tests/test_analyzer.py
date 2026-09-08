import pytest
from backend.services.query_analyzer import QueryAnalyzer
from backend.services.sql_parser import SQLParseError

def test_simple_select():
    query = "SELECT * FROM users WHERE age > 25"
    analyzer = QueryAnalyzer(query)
    res = analyzer.analyze()
    
    assert res["valid"] is True
    assert res["query_type"] == "SELECT"
    assert len(res["tables"]) == 1
    assert res["tables"][0]["name"] == "users"
    
    # * expands differently, we shouldn't necessarily extract * as a normal column, but age should be
    cols = [c["name"] for c in res["columns"]]
    assert "age" in cols
    
    assert len(res["where_conditions"]) == 1
    assert res["where_conditions"][0]["column"] == "age"
    assert res["where_conditions"][0]["classification"] == "RANGE"
    assert res["where_conditions"][0]["operator"] == "GT"

def test_equality_and_order_by():
    query = "SELECT id, name FROM orders WHERE user_id = 5 ORDER BY order_date DESC"
    analyzer = QueryAnalyzer(query)
    res = analyzer.analyze()
    
    assert res["tables"][0]["name"] == "orders"
    assert res["where_conditions"][0]["column"] == "user_id"
    assert res["where_conditions"][0]["classification"] == "EQUALITY"
    assert res["where_conditions"][0]["operator"] == "EQ"
    
    assert len(res["order_by"]) == 1
    assert res["order_by"][0]["column"] == "order_date"
    assert res["order_by"][0]["direction"] == "DESC"

def test_join_query():
    query = """
    SELECT u.name, o.order_date
    FROM users u
    JOIN orders o ON u.id = o.user_id
    WHERE u.id = 5
    """
    analyzer = QueryAnalyzer(query)
    res = analyzer.analyze()
    
    tables = {t["name"]: t["alias"] for t in res["tables"]}
    assert "users" in tables
    assert tables["users"] == "u"
    assert "orders" in tables
    
    assert len(res["joins"]) == 1
    assert res["joins"][0]["join_type"] == "INNER JOIN"
    assert res["joins"][0]["table"] == "orders"
    assert res["joins"][0]["alias"] == "o"
    assert len(res["joins"][0]["conditions"]) == 1
    
    # WHERE condition should resolve alias
    assert res["where_conditions"][0]["column"] == "id"
    assert res["where_conditions"][0]["table"] == "users"

def test_group_by_having():
    query = """
    SELECT user_id, COUNT(*) AS order_count
    FROM orders
    GROUP BY user_id
    HAVING COUNT(*) > 5
    """
    analyzer = QueryAnalyzer(query)
    res = analyzer.analyze()
    
    assert len(res["group_by"]) == 1
    assert res["group_by"][0]["column"] == "user_id"
    
    assert len(res["where_conditions"]) == 0
    assert len(res["having"]) == 1

def test_composite_order_preservation():
    query = """
    SELECT * FROM orders
    WHERE user_id = 5 AND order_date >= '2026-01-01'
    ORDER BY user_id ASC, order_date DESC
    """
    analyzer = QueryAnalyzer(query)
    res = analyzer.analyze()
    
    # Predicate extraction order
    assert res["where_conditions"][0]["column"] == "user_id"
    assert res["where_conditions"][1]["column"] == "order_date"
    
    # ORDER BY extraction order
    assert res["order_by"][0]["column"] == "user_id"
    assert res["order_by"][0]["direction"] == "ASC"
    assert res["order_by"][0]["sequence"] == 1
    
    assert res["order_by"][1]["column"] == "order_date"
    assert res["order_by"][1]["direction"] == "DESC"
    assert res["order_by"][1]["sequence"] == 2

def test_invalid_sql():
    with pytest.raises(SQLParseError):
        analyzer = QueryAnalyzer("SELECT * FORM users;")
        analyzer.analyze()

def test_unsupported_sql_type():
    with pytest.raises(ValueError, match="currently supports SELECT"):
        analyzer = QueryAnalyzer("UPDATE users SET age = 26 WHERE id = 1")
        analyzer.analyze()

def test_distinct_and_limit():
    query = "SELECT DISTINCT name FROM users LIMIT 10"
    analyzer = QueryAnalyzer(query)
    res = analyzer.analyze()
    assert res["distinct"] is True
    assert res["limit"] == "10"

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import Base, get_db
from sqlalchemy.pool import StaticPool
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}, poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def cleanup():
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield

def test_multiple_statements_rejected():
    with pytest.raises(SQLParseError, match="Only one SQL statement is allowed."):
        QueryAnalyzer("SELECT * FROM users; DROP TABLE users;")
    with pytest.raises(SQLParseError, match="Only one SQL statement is allowed."):
        QueryAnalyzer("SELECT * FROM users; SELECT * FROM orders;")

def test_semicolon_inside_string_allowed():
    analyzer = QueryAnalyzer("SELECT * FROM users WHERE name = 'Alice;Bob'")
    res = analyzer.analyze()
    assert res["valid"] is True
    assert res["where_conditions"][0]["classification"] == "EQUALITY"

def test_predicates_all_types():
    analyzer = QueryAnalyzer("""
        SELECT * FROM t 
        WHERE age = 20 
          AND age > 20 
          AND age >= 20 
          AND age < 20 
          AND age <= 20 
          AND age BETWEEN 20 AND 30 
          AND id IN (1, 2, 3) 
          AND name LIKE 'A%' 
          AND deleted_at IS NULL
    """)
    res = analyzer.analyze()
    conds = res["where_conditions"]
    assert len(conds) == 9
    classifications = [c["classification"] for c in conds]
    assert "EQUALITY" in classifications
    assert classifications.count("RANGE") == 5
    assert "IN" in classifications
    assert "LIKE" in classifications
    assert "NULL_CHECK" in classifications

def test_and_or_extraction():
    analyzer = QueryAnalyzer("SELECT * FROM users WHERE age > 20 AND status = 'active'")
    res = analyzer.analyze()
    assert len(res["where_conditions"]) == 2
    ops = [c["operator"] for c in res["where_conditions"]]
    assert "AND" not in ops
    
    analyzer2 = QueryAnalyzer("SELECT * FROM users WHERE age > 20 OR status = 'active'")
    res2 = analyzer2.analyze()
    assert len(res2["where_conditions"]) == 2
    ops2 = [c["operator"] for c in res2["where_conditions"]]
    assert "OR" not in ops2

def test_explicit_joins():
    analyzer = QueryAnalyzer("""
        SELECT u.id 
        FROM users u 
        LEFT JOIN orders o ON u.id = o.user_id 
        RIGHT JOIN profiles p ON u.id = p.user_id
    """)
    res = analyzer.analyze()
    joins = res["joins"]
    assert len(joins) == 2
    assert joins[0]["join_type"] == "LEFT JOIN"
    assert joins[0]["table"] == "orders"
    assert joins[1]["join_type"] == "RIGHT JOIN"
    assert joins[1]["table"] == "profiles"

def test_alias_resolution():
    analyzer = QueryAnalyzer("SELECT u.name FROM users u WHERE u.age > 20 ORDER BY u.name")
    res = analyzer.analyze()
    assert res["where_conditions"][0]["table"] == "users"
    assert res["order_by"][0]["table"] == "users"

def test_group_by_having_explicit():
    analyzer = QueryAnalyzer("SELECT user_id, COUNT(*) FROM orders GROUP BY user_id HAVING COUNT(*) > 5")
    res = analyzer.analyze()
    assert res["group_by"][0]["column"] == "user_id"
    assert res["group_by"][0]["sequence"] == 1
    assert len(res["having"]) == 1

def test_distinct_limit_explicit():
    analyzer = QueryAnalyzer("SELECT DISTINCT name FROM users LIMIT 10")
    res = analyzer.analyze()
    assert res["distinct"] is True
    assert res["limit"] == "10"
    
    analyzer2 = QueryAnalyzer("SELECT name FROM users")
    res2 = analyzer2.analyze()
    assert res2["distinct"] is False
    assert res2["limit"] is None

def test_edge_cases_sql():
    with pytest.raises(SQLParseError):
        QueryAnalyzer("")
    with pytest.raises(SQLParseError):
        QueryAnalyzer("   \n   ")
    with pytest.raises(ValueError, match="currently supports SELECT"):
        QueryAnalyzer("UPDATE users SET age = 20").analyze()
    with pytest.raises(ValueError, match="currently supports SELECT"):
        QueryAnalyzer("INSERT INTO users (id) VALUES (1)").analyze()
    with pytest.raises(ValueError, match="currently supports SELECT"):
        QueryAnalyzer("DELETE FROM users").analyze()
    with pytest.raises(ValueError, match="currently supports SELECT"):
        QueryAnalyzer("DROP TABLE users").analyze()
    
    # Comments
    analyzer = QueryAnalyzer("SELECT * FROM users /* comment */ WHERE id = 1")
    res = analyzer.analyze()
    assert res["valid"] is True

def test_schema_aware_validation():
    # Setup schema
    sch = client.post("/api/schemas/", json={"name": "test_schema_aware"}).json()
    t1 = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "users"}).json()
    client.post(f"/api/schemas/tables/{t1['id']}/columns", json={"name": "id", "data_type": "INT"})
    client.post(f"/api/schemas/tables/{t1['id']}/columns", json={"name": "name", "data_type": "VARCHAR"})
    
    t2 = client.post(f"/api/schemas/{sch['id']}/tables", json={"name": "orders"}).json()
    client.post(f"/api/schemas/tables/{t2['id']}/columns", json={"name": "id", "data_type": "INT"})
    client.post(f"/api/schemas/tables/{t2['id']}/columns", json={"name": "user_id", "data_type": "INT"})

    def analyze(query):
        return client.post("/api/queries/analyze", json={"query": query, "schema_id": sch['id']})
    
    # Valid
    assert analyze("SELECT id, name FROM users").status_code == 200
    
    # Nonexistent table
    assert analyze("SELECT * FROM fake_table").status_code == 400
    
    # Valid qualified column
    assert analyze("SELECT users.name FROM users").status_code == 200
    
    # Nonexistent qualified column
    assert analyze("SELECT users.fake_col FROM users").status_code == 400
    
    # Valid unqualified column
    assert analyze("SELECT name FROM users, orders").status_code == 200
    
    # Nonexistent unqualified column
    assert analyze("SELECT fake_col FROM users").status_code == 400
    
    # Ambiguous unqualified column
    assert analyze("SELECT id FROM users, orders").status_code == 400
    
    # Valid table aliases & referenced through alias
    assert analyze("SELECT u.name FROM users u").status_code == 200

