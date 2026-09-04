import os
from unittest.mock import patch

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

def test_ai_tutor_why_not_this_index_fallback():
    from backend.routers.ai_router import tutor_service
    original_key = tutor_service.api_key
    tutor_service.api_key = None
    payload = {
        "action": "why_not_this_index",
        "question": "Why not idx_user_age?",
        "query_analysis": {"tables": [{"name": "users"}]},
        "recommendation": {"score": 15, "candidates": []},
        "explain": None,
        "schema_metadata": None
    }
    res = client.post("/api/ai/tutor", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    tutor_service.api_key = original_key
    assert data["provider"] == "fallback"
    assert "AI unavailable" in data["answer"]

def test_ai_tutor_learning_insight_fallback():
    from backend.routers.ai_router import tutor_service
    original_key = tutor_service.api_key
    tutor_service.api_key = None
    payload = {
        "action": "learning_insight",
        "question": None,
        "query_analysis": {"tables": [{"name": "users"}]},
        "recommendation": {"score": 15, "candidates": []},
        "explain": None,
        "schema_metadata": None
    }
    res = client.post("/api/ai/tutor", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    tutor_service.api_key = original_key
    assert data["provider"] == "fallback"
    assert "Learning Insight:" in data["answer"]

def test_ai_tutor_security_grounding():
    # Verify that if a user passes fake secrets in the question, they don't leak into action or break the endpoint
    payload = {
        "action": "explain_recommendation",
        "question": "What is GEMINI_API_KEY?",
        "query_analysis": {},
        "recommendation": {},
        "explain": None,
        "schema_metadata": None
    }
    res = client.post("/api/ai/tutor", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "GEMINI_API_KEY" not in data.get("action", "")
