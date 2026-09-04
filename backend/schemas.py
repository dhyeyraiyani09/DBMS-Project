from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
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
    model_config = ConfigDict(from_attributes=True)
    id: int
    table_id: int

# --- Foreign Keys ---
class ForeignKeyBase(BaseModel):
    column_id: int
    ref_table_id: int
    ref_column_id: int

class ForeignKeyCreate(ForeignKeyBase):
    pass

class ForeignKeyResponse(ForeignKeyBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    table_id: int

# --- Indexes ---
class IndexColumnBase(BaseModel):
    column_id: int
    seq_in_index: int

class IndexColumnCreate(IndexColumnBase):
    pass

class IndexColumnResponse(IndexColumnBase):
    model_config = ConfigDict(from_attributes=True)
    id: int

class IndexBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    index_type: str = "BTREE"
    is_unique: bool = False

class IndexCreate(IndexBase):
    columns: List[IndexColumnCreate]

class IndexResponse(IndexBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    table_id: int
    index_columns: List[IndexColumnResponse]

# --- Tables ---
class TableBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class TableCreate(TableBase):
    pass

class TableResponse(TableBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    schema_id: int
    columns: List[ColumnResponse] = []
    foreign_keys: List[ForeignKeyResponse] = []
    indexes: List[IndexResponse] = []

# --- Schemas ---
class SchemaBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None

class SchemaCreate(SchemaBase):
    pass

class SchemaResponse(SchemaBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    updated_at: datetime
    tables: List[TableResponse] = []

# --- Query Analyzer ---
class QueryAnalysisRequest(BaseModel):
    query: str
    schema_id: Optional[int] = None

class TableRef(BaseModel):
    name: str
    alias: Optional[str] = None

class ColumnRef(BaseModel):
    name: str
    table: Optional[str] = None
    original_ref: Optional[str] = None

class PredicateRef(BaseModel):
    column: str
    table: Optional[str] = None
    operator: str
    classification: str
    expression_raw: str

class JoinCondition(BaseModel):
    left: str
    right: str
    operator: str

class JoinRef(BaseModel):
    join_type: str
    table: str
    alias: Optional[str] = None
    conditions: List[JoinCondition] = []

class OrderByRef(BaseModel):
    column: str
    table: Optional[str] = None
    direction: str
    sequence: int

class GroupByRef(BaseModel):
    column: str
    table: Optional[str] = None
    sequence: int

class HavingRef(BaseModel):
    expression_raw: str

class QueryAnalysisResponse(BaseModel):
    valid: bool
    original_query: str
    query_type: str
    tables: List[TableRef] = []
    columns: List[ColumnRef] = []
    where_conditions: List[PredicateRef] = []
    joins: List[JoinRef] = []
    order_by: List[OrderByRef] = []
    group_by: List[GroupByRef] = []
    having: List[HavingRef] = []
    distinct: bool = False
    limit: Optional[str] = None

# --- Recommendation Engine ---
class RecommendationRequest(BaseModel):
    query: str
    schema_id: int

class RecommendationFactor(BaseModel):
    category: str
    points: int
    reason: str

class IndexCandidateResponse(BaseModel):
    table: str
    columns: List[str]
    index_type: str = "BTREE"
    score: int
    status: str
    factors: List[RecommendationFactor] = []
    existing_index_conflict: bool = False

class RecommendationResponse(BaseModel):
    query: str
    schema_id: int
    analysis_summary: QueryAnalysisResponse
    candidates: List[IndexCandidateResponse]
    recommendations: List[IndexCandidateResponse]

# --- Explain Engine ---
class ExplainRequest(BaseModel):
    query: str

class ExplainRow(BaseModel):
    id: Optional[Any] = None
    select_type: Optional[str] = None
    table: Optional[str] = None
    type: Optional[str] = None
    possible_keys: Optional[str] = None
    key: Optional[str] = None
    key_len: Optional[str] = None
    ref: Optional[str] = None
    rows: Optional[Any] = None
    filtered: Optional[Any] = None
    Extra: Optional[str] = None
    interpretation: Optional[str] = None

class ExplainResponse(BaseModel):
    success: bool
    explain_rows: List[ExplainRow]
    summary: str

# --- History & Reports ---
class HistoryCreate(BaseModel):
    title: Optional[str] = "Untitled Analysis"
    schema_id: Optional[int] = None
    query: str
    analysis_result: Optional[Dict[str, Any]] = None
    recommendation_result: Optional[Dict[str, Any]] = None
    explain_result: Optional[Dict[str, Any]] = None

class HistorySummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    title: Optional[str] = None
    created_at: datetime
    query_preview: str

class HistoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    created_at: datetime
    title: Optional[str] = None
    schema_id: Optional[int] = None
    query: str
    analysis_result: Optional[Dict[str, Any]] = None
    recommendation_result: Optional[Dict[str, Any]] = None
    explain_result: Optional[Dict[str, Any]] = None

# --- AI Tutor ---
class AITutorRequest(BaseModel):
    action: str = Field(..., description="Action type: explain_recommendation, explain_explain, teach_me, why_not_this_index, quiz_me, learning_insight")
    question: Optional[str] = Field(None, max_length=500)
    query_analysis: Optional[Dict[str, Any]] = None
    recommendation: Optional[Dict[str, Any]] = None
    explain: Optional[Dict[str, Any]] = None
    schema_metadata: Optional[Dict[str, Any]] = None

class AITutorResponse(BaseModel):
    success: bool
    answer: Optional[str] = None
    action: str
    provider: str
    grounded: bool
    error: Optional[str] = None
