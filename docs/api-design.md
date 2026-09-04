# API Design

## Conceptual Endpoints

### 1. `GET /api/health`
- **Purpose:** Check backend status.
- **Request:** None.
- **Response:** `{"status": "ok", "version": "1.0"}`
- **Errors:** 500 Internal Server Error if DB is unreachable.

### 2. `POST /api/schemas`
- **Purpose:** Create a new mock schema definition.
- **Request:** JSON object containing schema name, tables, columns, PKs, FKs, and existing indexes.
- **Response:** `{"schema_id": 123, "status": "created"}`
- **Validation:** Ensure table and column names are valid strings without SQL injection vectors.
- **Errors:** 400 Bad Request (Invalid format, duplicate tables).

### 3. `GET /api/schemas/{id}`
- **Purpose:** Retrieve an existing schema definition.
- **Request:** URL path parameter `id`.
- **Response:** Complete JSON structure of the schema, tables, and existing indexes.
- **Errors:** 404 Not Found.

### 4. `POST /api/queries/analyze`
- **Purpose:** Analyze an SQL query against a schema and generate candidate indexes.
- **Request:** `{"schema_id": 123, "query": "SELECT ...", "frequency": 10}`
- **Response:** JSON detailing parsed operations, generated candidates, and existing index flags.
- **Validation:** SQL query must not be empty. Must parse successfully.
- **Errors:** 400 Bad Request (Invalid SQL syntax, Unknown table/column).

### 5. `POST /api/recommendations`
- **Purpose:** Trigger the scoring engine to rank candidates and produce the final recommendation.
- **Request:** Candidates payload (often bundled with the `/analyze` endpoint in practice, but conceptually separate).
- **Response:** List of ranked candidates with scores and text reasoning.
- **Errors:** 500 Internal Server Error (Scoring engine failure).

### 6. `POST /api/explain`
- **Purpose:** Run `EXPLAIN` on the mock DB to retrieve execution plans.
- **Request:** `{"schema_id": 123, "query": "SELECT ...", "proposed_index": {...}}`
- **Response:** `{"before": {...explain JSON...}, "after": {...explain JSON...}}`
- **Errors:** 400 Bad Request (EXPLAIN failure, unsupported syntax).

### 7. `GET /api/history`
- **Purpose:** Retrieve analysis history for the user/session.
- **Request:** Query params for pagination (limit, offset).
- **Response:** Array of past analysis runs with timestamps and summaries.
- **Errors:** 401 Unauthorized (if auth is used).

### 8. `POST /api/reports`
- **Purpose:** Generate a downloadable report.
- **Request:** `{"history_id": 456, "format": "pdf"}`
- **Response:** File stream (PDF/DOCX/TXT).
- **Errors:** 500 Internal Server Error (Report generation failure).
