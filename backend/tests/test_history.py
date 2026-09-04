from fastapi.testclient import TestClient
from backend.main import app
from backend.models import AnalysisHistory
from backend.database import SessionLocal, engine
import pytest

client = TestClient(app)

def test_history_workflow():
    # 1. Save History
    payload = {
        "title": "Test Query Analysis",
        "schema_id": None,
        "query": "SELECT * FROM users WHERE age > 25",
        "analysis_result": {"tables": [{"name": "users"}]},
        "recommendation_result": {"candidates": []},
        "explain_result": {"success": True, "explain_rows": [{"table": "users", "type": "range"}]}
    }
    res = client.post("/api/history/", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "id" in data
    h_id = data["id"]
    
    # 2. List History
    res2 = client.get("/api/history/")
    assert res2.status_code == 200
    hist_list = res2.json()
    assert len(hist_list) > 0
    assert any(h["id"] == h_id for h in hist_list)
    
    # 3. Retrieve Detail
    res3 = client.get(f"/api/history/{h_id}")
    assert res3.status_code == 200
    assert res3.json()["query"] == "SELECT * FROM users WHERE age > 25"
    
    # 4. Generate TXT Report
    res4 = client.get(f"/api/history/{h_id}/report?format=txt")
    assert res4.status_code == 200
    assert b"INDEX RECOMMENDATION ENGINE" in res4.content
    
    # 5. Generate PDF Report
    res5 = client.get(f"/api/history/{h_id}/report?format=pdf")
    assert res5.status_code == 200
    assert b"%PDF" in res5.content
    
    # 6. Generate DOCX Report
    res6 = client.get(f"/api/history/{h_id}/report?format=docx")
    assert res6.status_code == 200
    assert b"word/document.xml" in res6.content
    
    # 7. Delete History
    res7 = client.delete(f"/api/history/{h_id}")
    assert res7.status_code == 200
    
    res8 = client.get(f"/api/history/{h_id}")
    assert res8.status_code == 404
