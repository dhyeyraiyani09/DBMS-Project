from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

from backend.schemas import ExplainRequest, ExplainResponse
from backend.services.explain_analyzer import ExplainAnalyzer, ExplainError

router = APIRouter(
    prefix="/api/explain",
    tags=["explain"]
)

@router.post("/", response_model=ExplainResponse)
def explain_query(request: ExplainRequest):
    """
    Executes a MySQL EXPLAIN on the given SELECT query.
    Returns normalized execution plan and educational interpretations.
    """
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="SQL query cannot be empty.")
    
    try:
        analyzer = ExplainAnalyzer(request.query, request.schema_id)
        result = analyzer.execute_explain()
        return result
    except ExplainError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal Server Error: {str(e)}")
