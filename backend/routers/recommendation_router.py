from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.query_analyzer import QueryAnalyzer
from ..services.sql_parser import SQLParseError
from ..services.recommendation_engine import RecommendationEngine
from typing import Any, Dict

router = APIRouter(prefix="/api/recommendations", tags=["Recommendations"])

@router.post("/", response_model=schemas.RecommendationResponse)
def get_recommendations(request: schemas.RecommendationRequest, db: Session = Depends(get_db)):
    try:
        # 1. Analyze the query using Phase 3 engine
        analyzer = QueryAnalyzer(request.query)
        analysis_result = analyzer.analyze()
        
        # 2. Fetch schema
        db_schema = db.query(models.SchemaDef).filter(models.SchemaDef.id == request.schema_id).first()
        if not db_schema:
            raise HTTPException(status_code=404, detail=f"Schema ID {request.schema_id} not found.")
            
        # Serialize schema layout for Phase 4 Engine
        # We need tables, columns (with data_types and pk status), and indexes
        schema_dict = {
            "id": db_schema.id,
            "name": db_schema.name,
            "tables": []
        }
        for table in db_schema.tables:
            t_dict = {
                "name": table.name,
                "columns": [],
                "indexes": []
            }
            for col in table.columns:
                t_dict["columns"].append({
                    "id": col.id,
                    "name": col.name,
                    "data_type": col.data_type,
                    "is_primary_key": col.is_primary_key
                })
            for idx in table.indexes:
                i_dict = {
                    "name": idx.name,
                    "index_columns": [{"column_id": ic.column_id, "seq_in_index": ic.seq_in_index} for ic in idx.index_columns]
                }
                t_dict["indexes"].append(i_dict)
            schema_dict["tables"].append(t_dict)
            
        # 3. Generate Recommendations using deterministic engine
        engine = RecommendationEngine(analysis_result, schema_dict)
        rec_result = engine.run()
        
        return rec_result
        
    except SQLParseError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException as e:
        raise e
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during recommendation generation: {str(e)}")
