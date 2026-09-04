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
    
    # Valid Nested SELECT
    analyzer = ExplainAnalyzer("SELECT * FROM users WHERE id IN (SELECT user_id FROM orders)")
    analyzer._validate_safe_select()
    
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
            ExplainAnalyzer(q)._validate_safe_select()
        assert "Only SELECT queries are allowed" in str(excinfo.value)
        
    # Multi-statement / Injection
    with pytest.raises(ExplainError):
        ExplainAnalyzer("SELECT * FROM users; DROP TABLE users;")._validate_safe_select()
        
    # Comments bypass test
    with pytest.raises(ExplainError):
        ExplainAnalyzer("SELECT * FROM users /* comment */; DROP TABLE users;")._validate_safe_select()

def test_explain_api_empty_query():
    response = client.post("/api/explain/", json={"query": ""})
    assert response.status_code == 400
    assert "SQL query cannot be empty" in response.json()["detail"]

def test_explain_api_invalid_query():
    response = client.post("/api/explain/", json={"query": "DELETE FROM users"})
    assert response.status_code == 400
    assert "Only SELECT queries are allowed" in response.json()["detail"]

def test_explain_api_valid_query():
    # Because we created the 'orders' table in the test DB, this should execute.
    response = client.post("/api/explain/", json={"query": "SELECT * FROM orders WHERE user_id = 5"})
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "explain_rows" in data
    assert isinstance(data["explain_rows"], list)
