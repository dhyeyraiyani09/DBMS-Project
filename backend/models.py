from sqlalchemy import Column, Integer, String, Text, Boolean, ForeignKey, DateTime, UniqueConstraint, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base

class SchemaDef(Base):
    __tablename__ = "schemas_def"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())

    tables = relationship("TableDef", back_populates="schema", cascade="all, delete-orphan")

class TableDef(Base):
    __tablename__ = "tables_def"

    id = Column(Integer, primary_key=True, index=True)
    schema_id = Column(Integer, ForeignKey("schemas_def.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)

    __table_args__ = (UniqueConstraint('schema_id', 'name', name='_schema_table_uc'),)

    schema = relationship("SchemaDef", back_populates="tables")
    columns = relationship("ColumnDef", back_populates="table", cascade="all, delete-orphan")
    indexes = relationship("IndexDef", back_populates="table", cascade="all, delete-orphan")
    foreign_keys = relationship("ForeignKeyDef", foreign_keys="[ForeignKeyDef.table_id]", back_populates="table", cascade="all, delete-orphan")

class ColumnDef(Base):
    __tablename__ = "columns_def"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("tables_def.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    data_type = Column(String(50), nullable=False)
    nullable = Column(Boolean, default=True)
    default_value = Column(String(255), nullable=True)
    is_primary_key = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint('table_id', 'name', name='_table_column_uc'),)

    table = relationship("TableDef", back_populates="columns")
    # Relationships for foreign keys and index columns could be added if needed

class ForeignKeyDef(Base):
    __tablename__ = "foreign_keys_def"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("tables_def.id", ondelete="CASCADE"), nullable=False)
    column_id = Column(Integer, ForeignKey("columns_def.id", ondelete="CASCADE"), nullable=False)
    ref_table_id = Column(Integer, ForeignKey("tables_def.id", ondelete="CASCADE"), nullable=False)
    ref_column_id = Column(Integer, ForeignKey("columns_def.id", ondelete="CASCADE"), nullable=False)

    table = relationship("TableDef", foreign_keys=[table_id], back_populates="foreign_keys")
    column = relationship("ColumnDef", foreign_keys=[column_id])
    ref_table = relationship("TableDef", foreign_keys=[ref_table_id])
    ref_column = relationship("ColumnDef", foreign_keys=[ref_column_id])

class IndexDef(Base):
    __tablename__ = "indexes_def"

    id = Column(Integer, primary_key=True, index=True)
    table_id = Column(Integer, ForeignKey("tables_def.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    index_type = Column(String(50), default='BTREE')
    is_unique = Column(Boolean, default=False)

    __table_args__ = (UniqueConstraint('table_id', 'name', name='_table_index_uc'),)

    table = relationship("TableDef", back_populates="indexes")
    index_columns = relationship("IndexColumnDef", back_populates="index", cascade="all, delete-orphan", order_by="IndexColumnDef.seq_in_index")

class IndexColumnDef(Base):
    __tablename__ = "index_columns_def"

    id = Column(Integer, primary_key=True, index=True)
    index_id = Column(Integer, ForeignKey("indexes_def.id", ondelete="CASCADE"), nullable=False)
    column_id = Column(Integer, ForeignKey("columns_def.id", ondelete="CASCADE"), nullable=False)
    seq_in_index = Column(Integer, nullable=False)

    __table_args__ = (
        UniqueConstraint('index_id', 'seq_in_index', name='_index_seq_uc'),
        UniqueConstraint('index_id', 'column_id', name='_index_col_uc'),
    )

    index = relationship("IndexDef", back_populates="index_columns")
    column = relationship("ColumnDef")

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    title = Column(String(255), nullable=True)
    schema_id = Column(Integer, ForeignKey("schemas_def.id", ondelete="SET NULL"), nullable=True)
    query = Column(Text, nullable=False)
    
    # Store JSON representation of the complex objects
    analysis_result = Column(JSON, nullable=True)
    recommendation_result = Column(JSON, nullable=True)
    explain_result = Column(JSON, nullable=True)
    
    # Relationship just for convenience if we want to load schema details
    schema = relationship("SchemaDef")
