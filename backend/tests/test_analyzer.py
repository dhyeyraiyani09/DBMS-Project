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
