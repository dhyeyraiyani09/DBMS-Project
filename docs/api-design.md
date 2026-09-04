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

## Implemented in Phase 3

### 9. `POST /api/queries/analyze`
- **Purpose:** Analyze an SQL query against a schema (optional) to extract syntax structure.
- **Request:** `{"query": "SELECT * FROM users WHERE age > 25;", "schema_id": 1}`
- **Response:** JSON structured representation of query structure:
```json
{
  "valid": true,
  "original_query": "SELECT * FROM users WHERE age > 25;",
  "query_type": "SELECT",
  "tables": [{"name": "users", "alias": null}],
  "columns": [{"name": "age", "table": "users", "original_ref": null}],
  "where_conditions": [{"column": "age", "table": "users", "operator": "GT", "classification": "RANGE", "expression_raw": "age > 25"}],
  "joins": [],
  "order_by": [],
  "group_by": [],
  "having": [],
  "distinct": false,
  "limit": null
}
```
- **Errors:** 400 Bad Request (Invalid SQL, Unsupported Query Type, Schema Validation Errors like missing tables/columns).

---

## Planned for later phases

### 10. `POST /api/recommendations`
- **Purpose:** Trigger the scoring engine to rank candidates and produce the final recommendation.
- **Response:** List of ranked candidates with scores and reasoning.

### 11. `POST /api/explain`
- **Purpose:** Run `EXPLAIN` on the mock DB to retrieve execution plans.

### 12. `GET /api/history`
- **Purpose:** Retrieve analysis history for the user/session.

### 13. `POST /api/reports`
- **Purpose:** Generate a downloadable report.

### 10. `POST /api/recommendations/` (Implemented in Phase 4)
- **Purpose:** Analyze a query against a schema to generate index recommendations.
- **Request:** `{"query": "SELECT * FROM users WHERE age > 25;", "schema_id": 1}`
- **Response:** JSON representation of the query structural analysis and candidate generation:
```json
{
  "query": "SELECT * FROM users WHERE age > 25;",
  "schema_id": 1,
  "analysis_summary": { ... },
  "candidates": [
    {
      "table": "users",
      "columns": ["age"],
      "index_type": "BTREE",
      "score": 40,
      "status": "RECOMMENDED",
      "factors": [
        {"category": "WHERE_RANGE", "points": 20, "reason": "Column age is used in a range predicate."},
        {"category": "HIGH_SELECTIVITY", "points": 10, "reason": "Column age likely has high selectivity."}
      ],
      "existing_index_conflict": false
    }
  ],
  "recommendations": [ ... ]
}
```
- **Errors:** 400 Bad Request (Invalid SQL), 404 Not Found (Missing Schema), 500 Internal Error.

## EXPLAIN Engine
* **Endpoint:** `POST /api/explain/`
* **Purpose:** Safely evaluates MySQL `EXPLAIN FORMAT=TRADITIONAL` for AST-validated read-only `SELECT` queries returning mapped optimizer properties distinguishing heuristics from execution realities.

## History & Reports Engine
* **Endpoints:** 
  * `POST /api/history/` - Commits a completed analytical pipeline payload (Query, Analysis, Recommendations, EXPLAIN) into persistence.
  * `GET /api/history/` - Retrieves high-level sequence histories.
  * `GET /api/history/{id}` - Retrieves exact historical JSON dictionaries.
  * `GET /api/history/{id}/report?format=pdf|docx|txt` - Compiles professional analytical reports server-side bypassing client bounds natively.
