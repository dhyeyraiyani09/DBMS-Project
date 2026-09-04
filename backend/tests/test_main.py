from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "index-recommendation-engine"
    assert "database" in data
    # Database status could be 'connected' or 'disconnected' depending on local setup,
    # but the API itself should not crash and should return 200.
    assert data["database"] in ["connected", "disconnected"]
