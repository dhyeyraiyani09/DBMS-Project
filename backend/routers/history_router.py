from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from typing import List, Optional
import json

from backend.database import get_db
from backend.models import AnalysisHistory
from backend.schemas import HistoryCreate, HistoryResponse, HistorySummary
from backend.services.report_generator import ReportGenerator

router = APIRouter(
    prefix="/api/history",
    tags=["history"]
)

@router.post("/", response_model=HistoryResponse)
def save_history(history: HistoryCreate, db: Session = Depends(get_db)):
    db_history = AnalysisHistory(
        title=history.title,
        schema_id=history.schema_id,
        query=history.query,
        analysis_result=history.analysis_result,
        recommendation_result=history.recommendation_result,
        explain_result=history.explain_result
    )
    db.add(db_history)
    db.commit()
    db.refresh(db_history)
    return db_history

@router.get("/", response_model=List[HistorySummary])
def list_history(db: Session = Depends(get_db)):
    histories = db.query(AnalysisHistory).order_by(AnalysisHistory.created_at.desc()).all()
    results = []
    for h in histories:
        preview = h.query[:100] + "..." if len(h.query) > 100 else h.query
        results.append(HistorySummary(
            id=h.id,
            title=h.title,
            created_at=h.created_at,
            query_preview=preview
        ))
    return results

@router.get("/{history_id}", response_model=HistoryResponse)
def get_history(history_id: int, db: Session = Depends(get_db)):
    h = db.query(AnalysisHistory).filter(AnalysisHistory.id == history_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="History not found")
    return h

@router.delete("/{history_id}")
def delete_history(history_id: int, db: Session = Depends(get_db)):
    h = db.query(AnalysisHistory).filter(AnalysisHistory.id == history_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="History not found")
    db.delete(h)
    db.commit()
    return {"message": "History deleted"}

@router.get("/{history_id}/report")
def download_report(history_id: int, format: str = "txt", db: Session = Depends(get_db)):
    h = db.query(AnalysisHistory).filter(AnalysisHistory.id == history_id).first()
    if not h:
        raise HTTPException(status_code=404, detail="History not found")
    
    fmt = format.lower()
    generator = ReportGenerator(h)
    
    if fmt == "txt":
        content = generator.generate_txt()
        return Response(
            content=content,
            media_type="text/plain",
            headers={"Content-Disposition": f"attachment; filename=index-analysis-{history_id}.txt"}
        )
    elif fmt == "pdf":
        content = generator.generate_pdf()
        return Response(
            content=content,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=index-analysis-{history_id}.pdf"}
        )
    elif fmt == "docx":
        content = generator.generate_docx()
        return Response(
            content=content,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={"Content-Disposition": f"attachment; filename=index-analysis-{history_id}.docx"}
        )
    else:
        raise HTTPException(status_code=400, detail="Unsupported report format")
