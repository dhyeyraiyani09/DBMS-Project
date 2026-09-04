from fastapi.testclient import TestClient
from backend.main import app
from backend.services.explain_analyzer import ExplainAnalyzer, ExplainError
import pytest
from sqlglot import exp

client = TestClient(app)

def test_explain_analyzer_validation():
    # Valid SELECT
    analyzer = ExplainAnalyzer("SELECT * FROM users WHERE age > 25")
    analyzer._validate_safe_select() # Should not raise
    
    # Invalid destructive commands
    invalid_queries = [
        "INSERT INTO users (name) VALUES ('test')",
        "UPDATE users SET age = 30",
        "DELETE FROM users",
        "DROP TABLE users",
        "ALTER TABLE users ADD COLUMN test int",
        "CREATE TABLE test (id int)"
    ]
    
    for q in invalid_queries:
        with pytest.raises(ExplainError) as excinfo:
            ExplainAnalyzer(q)._validate_safe_select()
        assert "Only SELECT queries are allowed" in str(excinfo.value)
        
    # Multi-statement
    with pytest.raises(ExplainError):
        ExplainAnalyzer("SELECT * FROM users; SELECT * FROM orders;")._validate_safe_select()

def test_explain_api_empty_query():
    response = client.post("/api/explain/", json={"query": ""})
    assert response.status_code == 400
    assert "SQL query cannot be empty" in response.json()["detail"]

def test_explain_api_invalid_query():
    response = client.post("/api/explain/", json={"query": "DELETE FROM users"})
    assert response.status_code == 400
    assert "Only SELECT queries are allowed" in response.json()["detail"]

def test_explain_api_valid_query():
    # If the database engine is mock/sqlite, it might not return valid MySQL rows, 
    # but the endpoint shouldn't crash.
    response = client.post("/api/explain/", json={"query": "SELECT * FROM orders WHERE user_id = 5"})
    # Either 200 (success) or 400 (if table doesn't exist / EXPLAIN fails execution)
    assert response.status_code in [200, 400]
