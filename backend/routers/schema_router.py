from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import text
from typing import List
from .. import models, schemas
from ..database import get_db
import re

router = APIRouter(prefix="/api/schemas", tags=["Schemas"])

def safe_quote(name: str) -> str:
    return f"`{name.replace('`', '').replace(';', '')}`"

def safe_type(dtype: str) -> str:
    # only allow safe characters for data types like VARCHAR(255), INT, etc.
    if not re.match(r"^[A-Za-z0-9\s\(\)\,]+$", dtype):
        raise HTTPException(400, "Invalid data type format")
    return dtype

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
        
    # Drop physical tables first
    for t in db_schema.tables:
        try:
            if db.get_bind().dialect.name != 'sqlite':
                db.execute(text(f"DROP TABLE IF EXISTS phy_{schema_id}_{t.id}"))
        except Exception as e:
            pass # continue cleanup even if physical table missing
            
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
        db.flush() # Get table ID without fully committing
        
        # Physical table creation
        physical_name = f"phy_{schema_id}_{db_table.id}"
        # Start with a dummy column (MySQL requires at least one column)
        if db.get_bind().dialect.name != 'sqlite':
            db.execute(text(f"DROP TABLE IF EXISTS {physical_name}"))
            db.execute(text(f"CREATE TABLE {physical_name} (_phy_dummy INT)"))
        
        db.commit()
        db.refresh(db_table)
        return db_table
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Table '{table.name}' already exists in this schema.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

# --- Column Routes ---
@router.post("/tables/{table_id}/columns", response_model=schemas.ColumnResponse, status_code=status.HTTP_201_CREATED)
def create_column(table_id: int, column: schemas.ColumnCreate, db: Session = Depends(get_db)):
    db_table = db.query(models.TableDef).filter(models.TableDef.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found.")
        
    db_col = models.ColumnDef(**column.model_dump(), table_id=table_id)
    try:
        db.add(db_col)
        db.flush()
        
        schema_id = db_table.schema_id
        physical_name = f"phy_{schema_id}_{table_id}"
        
        col_name = safe_quote(column.name)
        dtype = safe_type(column.data_type)
        
        # Build ALTER TABLE
        ddl = f"ALTER TABLE {physical_name} ADD COLUMN {col_name} {dtype}"
        if column.is_primary_key:
            ddl += f", ADD PRIMARY KEY ({col_name})"
            
        if db.get_bind().dialect.name != 'sqlite':
            db.execute(text(ddl))
        
        db.commit()
        db.refresh(db_col)
        return db_col
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Column '{column.name}' already exists in this table.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))

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
        db.flush()
        
        src_table = src_col.table
        physical_name = f"phy_{src_table.schema_id}_{table_id}"
        ref_physical_name = f"phy_{ref_table.schema_id}_{fk.ref_table_id}"
        
        src_col_name = safe_quote(src_col.name)
        ref_col_name = safe_quote(ref_col.name)
        fk_name = f"fk_phy_{db_fk.id}"
        
        ddl = f"ALTER TABLE {physical_name} ADD CONSTRAINT {fk_name} FOREIGN KEY ({src_col_name}) REFERENCES {ref_physical_name}({ref_col_name})"
        if db.get_bind().dialect.name != 'sqlite':
            db.execute(text(ddl))
        
        db.commit()
        db.refresh(db_fk)
        return db_fk
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="Failed to create foreign key relationship: " + str(e))

# --- Index Routes ---
@router.post("/tables/{table_id}/indexes", response_model=schemas.IndexResponse, status_code=status.HTTP_201_CREATED)
def create_index(table_id: int, index: schemas.IndexCreate, db: Session = Depends(get_db)):
    db_table = db.query(models.TableDef).filter(models.TableDef.id == table_id).first()
    if not db_table:
        raise HTTPException(status_code=404, detail="Table not found.")
        
    if not index.columns:
        raise HTTPException(status_code=400, detail="Index must have at least one column.")

    # Validate sequence
    seqs = sorted([col.seq_in_index for col in index.columns])
    if seqs[0] < 1:
        raise HTTPException(status_code=400, detail="seq_in_index must be a positive integer starting at 1.")
    
    expected_seq = list(range(1, len(seqs) + 1))
    if seqs != expected_seq:
        if len(set(seqs)) != len(seqs):
            raise HTTPException(status_code=400, detail="Duplicate seq_in_index values are not allowed.")
        raise HTTPException(status_code=400, detail="seq_in_index must be a contiguous sequence starting from 1.")

    # Validate all columns belong to the table BEFORE committing anything
    column_ids = [col.column_id for col in index.columns]
    valid_cols = db.query(models.ColumnDef).filter(
        models.ColumnDef.id.in_(column_ids),
        models.ColumnDef.table_id == table_id
    ).all()
    valid_col_dict = {c.id: c for c in valid_cols}
    
    for col_id in column_ids:
        if col_id not in valid_col_dict:
            raise HTTPException(status_code=400, detail=f"Column ID {col_id} does not exist in the specified table.")

    db_index = models.IndexDef(
        table_id=table_id,
        name=index.name,
        index_type=index.index_type,
        is_unique=index.is_unique
    )
    
    try:
        db.add(db_index)
        db.flush() # Flush to get db_index.id without committing
        
        # Add index columns
        col_names = []
        # Create a sorted list based on sequence
        sorted_idx_cols = sorted(index.columns, key=lambda x: x.seq_in_index)
        
        for idx_col in sorted_idx_cols:
            db_idx_col = models.IndexColumnDef(
                index_id=db_index.id,
                column_id=idx_col.column_id,
                seq_in_index=idx_col.seq_in_index
            )
            db.add(db_idx_col)
            col_names.append(safe_quote(valid_col_dict[idx_col.column_id].name))
            
        schema_id = db_table.schema_id
        physical_name = f"phy_{schema_id}_{table_id}"
        idx_physical_name = safe_quote(index.name)
        
        unique_str = "UNIQUE " if index.is_unique else ""
        cols_str = ", ".join(col_names)
        
        ddl = f"CREATE {unique_str}INDEX {idx_physical_name} ON {physical_name} ({cols_str})"
        if db.get_bind().dialect.name != 'sqlite':
            db.execute(text(ddl))
            
        db.commit()
        db.refresh(db_index)
        return db_index
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Invalid index data. Name might be duplicate.")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=str(e))
