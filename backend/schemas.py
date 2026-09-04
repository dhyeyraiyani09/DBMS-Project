from pydantic import BaseModel, Field, constr
from typing import List, Optional
from datetime import datetime

# --- Columns ---
class ColumnBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    data_type: str = Field(..., min_length=1, max_length=50)
    nullable: bool = True
    default_value: Optional[str] = None
    is_primary_key: bool = False

class ColumnCreate(ColumnBase):
    pass

class ColumnResponse(ColumnBase):
    id: int
    table_id: int
    
    class Config:
        from_attributes = True

# --- Foreign Keys ---
class ForeignKeyBase(BaseModel):
    column_id: int
    ref_table_id: int
    ref_column_id: int

class ForeignKeyCreate(ForeignKeyBase):
    pass

class ForeignKeyResponse(ForeignKeyBase):
    id: int
    table_id: int

    class Config:
        from_attributes = True

# --- Indexes ---
class IndexColumnBase(BaseModel):
    column_id: int
    seq_in_index: int

class IndexColumnCreate(IndexColumnBase):
    pass

class IndexColumnResponse(IndexColumnBase):
    id: int
    
    class Config:
        from_attributes = True

class IndexBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    index_type: str = "BTREE"
    is_unique: bool = False

class IndexCreate(IndexBase):
    columns: List[IndexColumnCreate]

class IndexResponse(IndexBase):
    id: int
    table_id: int
    index_columns: List[IndexColumnResponse]

    class Config:
        from_attributes = True

# --- Tables ---
class TableBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class TableCreate(TableBase):
    pass

class TableResponse(TableBase):
    id: int
    schema_id: int
    columns: List[ColumnResponse] = []
    foreign_keys: List[ForeignKeyResponse] = []
    indexes: List[IndexResponse] = []

    class Config:
        from_attributes = True

# --- Schemas ---
class SchemaBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class SchemaCreate(SchemaBase):
    pass

class SchemaResponse(SchemaBase):
    id: int
    created_at: datetime
    updated_at: datetime
    tables: List[TableResponse] = []

    class Config:
        from_attributes = True
