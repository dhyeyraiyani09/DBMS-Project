from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..services.query_analyzer import QueryAnalyzer
from ..services.sql_parser import SQLParseError

router = APIRouter(prefix="/api/queries", tags=["Queries"])

@router.post("/analyze", response_model=schemas.QueryAnalysisResponse)
def analyze_query(request: schemas.QueryAnalysisRequest, db: Session = Depends(get_db)):
    try:
        analyzer = QueryAnalyzer(request.query)
        analysis_result = analyzer.analyze()
        
        # Schema-aware validation if schema_id is provided
        if request.schema_id:
            db_schema = db.query(models.SchemaDef).filter(models.SchemaDef.id == request.schema_id).first()
            if not db_schema:
                raise HTTPException(status_code=404, detail=f"Schema ID {request.schema_id} not found.")
                
            # Build a quick lookup for tables and columns
            valid_tables = {t.name: {c.name for c in t.columns} for t in db_schema.tables}
            
            # Validate tables
            for table_ref in analysis_result["tables"]:
                if table_ref["name"] not in valid_tables:
                    raise HTTPException(status_code=400, detail=f"Table '{table_ref['name']}' does not exist in schema.")
            
            # Validate columns
            for col_ref in analysis_result["columns"]:
                table_context = col_ref["table"]
                col_name = col_ref["name"]
                
                # In wildcard selects (*), SQLGlot represents it as a Star object, which we typically ignore or handle specifically. 
                # Our extractor currently pulls explicit named columns.
                if col_name == "*":
                    continue
                    
                if table_context:
                    if table_context in valid_tables:
                        if col_name not in valid_tables[table_context]:
                             raise HTTPException(status_code=400, detail=f"Column '{col_name}' does not exist in table '{table_context}'.")
                    else:
                        raise HTTPException(status_code=400, detail=f"Table '{table_context}' referenced by column '{col_name}' does not exist.")
                else:
                    # Unqualified column. Must exist in exactly one of the queried tables.
                    found_in = []
                    for t in analysis_result["tables"]:
                        if t["name"] in valid_tables and col_name in valid_tables[t["name"]]:
                            found_in.append(t["name"])
                    
                    if len(found_in) == 0:
                        raise HTTPException(status_code=400, detail=f"Column '{col_name}' not found in any referenced table.")
                    if len(found_in) > 1:
                        raise HTTPException(status_code=400, detail=f"Column '{col_name}' is ambiguous. It exists in multiple tables: {', '.join(found_in)}")

        return analysis_result
        
    except SQLParseError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An unexpected error occurred during analysis: {str(e)}")
