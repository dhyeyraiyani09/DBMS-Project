# API Design

## Implemented in Phase 2

### 1. `GET /api/schemas/`
- **Purpose:** Retrieve all created schemas.
- **Response:** Array of Schema objects.

### 2. `POST /api/schemas/`
- **Purpose:** Create a new schema definition.
- **Request:** `{"name": "ecommerce", "description": "..."}`
- **Response:** `{"id": 1, "name": "ecommerce", ...}`
- **Errors:** 400 Bad Request (Duplicate name).

### 3. `GET /api/schemas/{id}`
- **Purpose:** Retrieve an existing schema definition (includes tables, columns, indexes).
- **Response:** Complete JSON structure of the schema.
- **Errors:** 404 Not Found.

### 4. `DELETE /api/schemas/{id}`
- **Purpose:** Delete a schema and cascade delete its contents.
- **Response:** 204 No Content.

### 5. `POST /api/schemas/{id}/tables`
- **Purpose:** Add a table to a schema.
- **Request:** `{"name": "users", "description": ""}`

### 6. `POST /api/schemas/tables/{id}/columns`
- **Purpose:** Add a column to a table.
- **Request:** `{"name": "id", "data_type": "INT", "is_primary_key": true, ...}`

### 7. `POST /api/schemas/tables/{id}/foreign-keys`
- **Purpose:** Define a foreign key relationship.
- **Request:** `{"column_id": 1, "ref_table_id": 2, "ref_column_id": 3}`

### 8. `POST /api/schemas/tables/{id}/indexes`
- **Purpose:** Define an index.
- **Request:** `{"name": "idx_user", "columns": [{"column_id": 1, "seq_in_index": 1}]}`

---

## Planned for later phases

### 9. `POST /api/queries/analyze`
- **Purpose:** Analyze an SQL query against a schema and generate candidate indexes.
- **Request:** `{"schema_id": 123, "query": "SELECT ...", "frequency": 10}`
- **Response:** JSON detailing parsed operations, generated candidates.

### 10. `POST /api/recommendations`
- **Purpose:** Trigger the scoring engine to rank candidates and produce the final recommendation.
- **Response:** List of ranked candidates with scores and reasoning.

### 11. `POST /api/explain`
- **Purpose:** Run `EXPLAIN` on the mock DB to retrieve execution plans.

### 12. `GET /api/history`
- **Purpose:** Retrieve analysis history for the user/session.

### 13. `POST /api/reports`
- **Purpose:** Generate a downloadable report.
