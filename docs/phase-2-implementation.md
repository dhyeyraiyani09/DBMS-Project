# Phase 2 Implementation Details

## 1. Phase 2 Objective
The objective was to implement a functional Database & Schema Management Module to allow users to define, view, and manage database schemas (tables, columns, foreign keys, and indexes) that will serve as the foundation for the upcoming SQL Analyzer and Recommendation Engine.

## 2. Database Architecture
The backend database schema was created in `database/schema.sql` utilizing MySQL. 
It supports maintaining strict relational integrity with `ON DELETE CASCADE`.

## 3. Tables Created
- `schemas_def`: Stores logical groupings (schemas).
- `tables_def`: Stores table names within a schema.
- `columns_def`: Stores columns, data types, and primary key status.
- `foreign_keys_def`: Stores relationships between source and target columns.
- `indexes_def`: Stores index definitions (BTREE/HASH) and uniqueness.
- `index_columns_def`: Stores ordered columns participating in an index, preserving `seq_in_index` crucial for composite index evaluation in future phases.

## 4. Relationships
- **Schema** 1:N **Tables**
- **Table** 1:N **Columns**
- **Table** 1:N **Indexes**
- **Index** 1:N **Index Columns**
- **Table/Column** N:1 **Foreign Keys**

## 5. API Endpoints (Implemented)
- `GET /api/schemas/` (Fetch all schemas)
- `POST /api/schemas/` (Create schema)
- `GET /api/schemas/{id}` (Fetch schema details including tables, cols, FKs, indexes)
- `DELETE /api/schemas/{id}` (Delete schema)
- `POST /api/schemas/{id}/tables` (Add table)
- `POST /api/schemas/tables/{id}/columns` (Add column)
- `POST /api/schemas/tables/{id}/foreign-keys` (Add foreign key)
- `POST /api/schemas/tables/{id}/indexes` (Add index with columns)

## 6. Validation Rules
- Backend API enforces `UniqueConstraint` on Schema names, Table names (per schema), and Column names (per table).
- Foreign Key creation verifies the existence of both the source column/table and referenced column/table.
- Index creation requires at least one valid column and ensures duplicate sequential orders are rejected.
- Graceful HTTP 400 responses with descriptive details replace raw stack traces.

## 7. Frontend Schema Management Workflow
- Implemented a `SchemaManager.jsx` React component.
- Users can create a schema from the sidebar.
- Selecting a schema reveals forms to add tables, columns, foreign keys, and composite indexes.
- Simple grid-based ER visualization provided using basic CSS boxes (`db-table`, `db-column`) to denote PK/FK and Index definitions clearly without requiring advanced SVG manipulation yet.

## 8. Sample Schema
A representative schema can be built via the UI or API:
- `users` (id PK, name, email)
- `orders` (id PK, user_id FK -> users.id, order_date)
- **Composite Index:** `idx_orders_user_date` on `orders` (user_id, order_date).

## 9. Testing Performed
- Backend automated tests written using `pytest` and an in-memory SQLite override to simulate and test CRUD operations safely.
- Covered Schema creation, Table creation, FK validation, and strict Composite Index ordering.

## 10. Test Results
- `test_create_schema` - **PASSED**
- `test_create_duplicate_schema` - **PASSED**
- `test_create_table` - **PASSED**
- `test_create_column` - **PASSED**
- `test_create_foreign_key` - **PASSED**
- `test_create_index_preserves_order` - **PASSED**

## 11. Known Limitations
- Modifying existing columns/tables (PUT endpoints) is deferred as creation/deletion is sufficient for the simulation pipeline for now.
- Advanced visual ER diagram rendering with interactive lines is deferred.

## 12. Deferred Functionality
The following features are strictly deferred to future phases:
- SQL parser & clause extraction.
- Index candidate generation & recommendation scoring.
- EXPLAIN analysis & execution benchmarking.
- B-tree visualization & AI Tutor.
- History, reports, and final educational pages.
