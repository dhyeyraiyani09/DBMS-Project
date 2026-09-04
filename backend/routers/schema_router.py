from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from typing import List
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/schemas", tags=["Schemas"])

@router.get("/", response_model=List[schemas.SchemaResponse])
def get_schemas(db: Session = Depends(get_db)):
    return db.query(models.SchemaDef).all()

@router.post("/", response_model=schemas.SchemaResponse, status_code=status.HTTP_201_CREATED)
def create_schema(schema: schemas.SchemaCreate, db: Session = Depends(get_db)):
    db_schema = models.SchemaDef(**schema.model_dump())
    try:
        db.add(db_schema)
        db.commit()
        db.refresh(db_schema)
        return db_schema
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Schema name already exists.")

@router.get("/{schema_id}", response_model=schemas.SchemaResponse)
def get_schema(schema_id: int, db: Session = Depends(get_db)):
    db_schema = db.query(models.SchemaDef).filter(models.SchemaDef.id == schema_id).first()
    if not db_schema:
        raise HTTPException(status_code=404, detail="Schema not found.")
    return db_schema

@router.delete("/{schema_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schema(schema_id: int, db: Session = Depends(get_db)):
    db_schema = db.query(models.SchemaDef).filter(models.SchemaDef.id == schema_id).first()
    if not db_schema:
        raise HTTPException(status_code=404, detail="Schema not found.")
    db.delete(db_schema)
    db.commit()

# --- Table Routes ---
@router.post("/{schema_id}/tables", response_model=schemas.TableResponse, status_code=status.HTTP_201_CREATED)
def create_table(schema_id: int, table: schemas.TableCreate, db: Session = Depends(get_db)):
    db_schema = db.query(models.SchemaDef).filter(models.SchemaDef.id == schema_id).first()
    if not db_schema:
        raise HTTPException(status_code=404, detail="Schema not found.")
    
    db_table = models.TableDef(**table.model_dump(), schema_id=schema_id)
    try:
        db.add(db_table)
        db.commit()
        db.refresh(db_table)
        return db_table
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Table '{table.name}' already exists in this schema.")

# --- Column Routes ---
@router.post("/tables/{table_id}/columns", response_model=schemas.ColumnResponse, status_code=status.HTTP_201_CREATED)
def create_column(table_id: int, column: schemas.ColumnCreate, db: Session = Depends(get_db)):
    db_table = db.query(models.TableDef).filter(models.TableDef.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found.")
        
    db_col = models.ColumnDef(**column.model_dump(), table_id=table_id)
    try:
        db.add(db_col)
        db.commit()
        db.refresh(db_col)
        return db_col
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Column '{column.name}' already exists in this table.")

# --- Foreign Key Routes ---
@router.post("/tables/{table_id}/foreign-keys", response_model=schemas.ForeignKeyResponse, status_code=status.HTTP_201_CREATED)
def create_foreign_key(table_id: int, fk: schemas.ForeignKeyCreate, db: Session = Depends(get_db)):
    # Validate columns exist
    src_col = db.query(models.ColumnDef).filter(models.ColumnDef.id == fk.column_id, models.ColumnDef.table_id == table_id).first()
    if not src_col:
         raise HTTPException(status_code=400, detail="Source column does not exist in the specified table.")
         
    ref_table = db.query(models.TableDef).filter(models.TableDef.id == fk.ref_table_id).first()
    if not ref_table:
         raise HTTPException(status_code=400, detail="Referenced table does not exist.")
         
    ref_col = db.query(models.ColumnDef).filter(models.ColumnDef.id == fk.ref_column_id, models.ColumnDef.table_id == fk.ref_table_id).first()
    if not ref_col:
         raise HTTPException(status_code=400, detail="Referenced column does not exist in the referenced table.")

    db_fk = models.ForeignKeyDef(**fk.model_dump(), table_id=table_id)
    try:
        db.add(db_fk)
        db.commit()
        db.refresh(db_fk)
        return db_fk
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to create foreign key relationship.")

# --- Index Routes ---
@router.post("/tables/{table_id}/indexes", response_model=schemas.IndexResponse, status_code=status.HTTP_201_CREATED)
def create_index(table_id: int, index: schemas.IndexCreate, db: Session = Depends(get_db)):
    db_table = db.query(models.TableDef).filter(models.TableDef.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found.")
        
    if not index.columns:
        raise HTTPException(status_code=400, detail="Index must have at least one column.")

    db_index = models.IndexDef(
        table_id=table_id,
        name=index.name,
        index_type=index.index_type,
        is_unique=index.is_unique
    )
    
    try:
        db.add(db_index)
        db.commit()
        db.refresh(db_index)
        
        # Add index columns
        for idx_col in index.columns:
            # Verify column exists
            col = db.query(models.ColumnDef).filter(models.ColumnDef.id == idx_col.column_id, models.ColumnDef.table_id == table_id).first()
            if not col:
                raise ValueError(f"Column ID {idx_col.column_id} does not exist in table.")
                
            db_idx_col = models.IndexColumnDef(
                index_id=db_index.id,
                column_id=idx_col.column_id,
                seq_in_index=idx_col.seq_in_index
            )
            db.add(db_idx_col)
            
        db.commit()
        db.refresh(db_index)
        return db_index
    except ValueError as ve:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(ve))
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Invalid index data. Name might be duplicate.")
