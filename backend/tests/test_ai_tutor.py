from fastapi.testclient import TestClient
from backend.main import app
import pytest

client = TestClient(app)

def test_ai_tutor_valid_request():
    payload = {
        "action": "explain_recommendation",
        "question": None,
        "query_analysis": {"tables": [{"name": "users"}]},
        "recommendation": {"score": 15},
        "explain": None,
        "schema_metadata": None
    }
    res = client.post("/api/ai/tutor", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "success" in data
    assert data["action"] == "explain_recommendation"

def test_ai_tutor_invalid_action():
    payload = {
        "action": "hack_database",
    }
    res = client.post("/api/ai/tutor", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is False
    assert "Invalid AI Tutor action" in data["error"]

def test_ai_tutor_oversized_question():
    payload = {
        "action": "teach_me",
        "question": "A" * 501
    }
    res = client.post("/api/ai/tutor", json=payload)
    assert res.status_code == 422
    assert "String should have at most 500 characters" in res.text
