# Phase 3 Implementation Details

## 1. Phase Objective
The goal of Phase 3 was to build a robust SQL Query Analyzer capable of parsing a SQL string into an Abstract Syntax Tree (AST), traversing that tree to extract meaningful structured information (tables, columns, where conditions, joins, etc.), and exposing this data to the frontend for visualization. This analyzer provides the foundation for the Phase 4 Index Recommendation engine without explicitly recommending any indexes itself.

## 2. SQL Parser Library Selected
**`sqlglot`** (>=23.2.0)

## 3. Why `sqlglot` was Selected
1. **Deterministic Structured AST**: `sqlglot` builds a formal semantic tree of the SQL query as opposed to regex engines or simple string splitters.
2. **Dialect Support**: It provides deep support for the MySQL dialect, preventing compatibility issues with the database structure built in Phase 2.
3. **No Execution Required**: `sqlglot` is a pure parser. It allows us to analyze user-provided SQL completely offline, strictly fulfilling our security requirement not to arbitrarily execute untrusted SQL logic during analysis.

## 4. Parser Architecture
* **`sql_parser.py`**: A low-level service wrapper around `sqlglot.parse_one`. Provides graceful error formatting and exceptions (`SQLParseError`).
* **`query_analyzer.py`**: A specialized semantic traversal layer (`QueryAnalyzer`) that extracts explicitly actionable items for the recommendation system (tables, predicates, columns, groupings).

## 5. Structured Query Representation
The query is represented via a standardized Pydantic JSON structure ensuring that the API contract is reliable:
```json
{
  "valid": true,
  "original_query": "SELECT * FROM users WHERE age > 25",
  "query_type": "SELECT",
  "tables": [
    {"name": "users", "alias": null}
  ],
  "columns": [
    {"name": "age", "table": "users", "original_ref": null}
  ],
  "where_conditions": [
    {
      "column": "age",
      "table": "users",
      "operator": "GT",
      "classification": "RANGE",
      "expression_raw": "age > 25"
    }
  ],
  "joins": [],
  "order_by": [],
  "group_by": [],
  "having": [],
  "distinct": false,
  "limit": null
}
```

## 6. Supported SQL Constructs
* **Query Types**: `SELECT`
* **Table Extraction**: Including Aliases.
* **Column Extraction**: Selectors, conditions, clauses.
* **WHERE Clause**: `EQUALITY`, `RANGE` (>, <, >=, <=, BETWEEN), `IN`, `LIKE`, `NULL_CHECK`, `OTHER`.
* **JOINs**: `INNER JOIN`, `LEFT JOIN`, `RIGHT JOIN` mapped dynamically with ON-condition extractions.
* **ORDER BY**: Extracting sequences (1, 2) and direction (`ASC`, `DESC`).
* **GROUP BY & HAVING**: Explicitly extracted separately from WHERE.
* **DISTINCT & LIMIT**

## 7. Validation Rules
* **Syntax Validation**: Invalid SQL queries immediately trigger detailed `SQLParseError`s mapped to HTTP 400.
* **Query Type Validation**: The engine cleanly rejects non-SELECT queries (e.g., `UPDATE`, `INSERT`) alerting the user that the tool is strictly for analytics queries currently.
* **Schema-Aware Validation (Optional)**: If a `schema_id` is supplied, the router queries the real database layout to verify:
  * Do the referenced tables exist?
  * Do the referenced columns exist in those tables?
  * Are there ambiguous columns (columns specified without prefixes present in multiple joined tables)?

## 8. API Endpoint
* **Implemented**: `POST /api/queries/analyze`

## 9. Frontend Workflow
* Added `QueryAnalyzer.jsx` linked under the "SQL Analyzer" tab.
* Provides a quick `textarea` input for testing SQL manually.
* Integrated dropdown selector to toggle Schema-Aware validation against schemas built in Phase 2.
* Preloaded 5 realistic demo cases to interactively test the backend parsing structure on button click.
* Presents parsed metrics in a distinct styled HTML card format avoiding full-screen visual complexities deferred for Phase 5.

## 10. Sample Queries Provided
The UI embeds 5 distinct samples reflecting standard application loads (E.g., Simple predicate, Complex JOINs, Sequence critical composite `ORDER BY`s).

## 11. Testing Strategy
A suite of `pytest` unit tests (`backend/tests/test_analyzer.py`) evaluate semantic extraction against diverse ASTs verifying precisely:
* Sequential composite extraction matches AST literal flow.
* Rejections properly intercept `SQLParseError`.
* Non-select errors intercept `ValueError`.
* Implicit cross-join and standard ON joins accurately record logical conditions.

## 12. Test Results
* `test_simple_select`: **PASSED**
* `test_equality_and_order_by`: **PASSED**
* `test_join_query`: **PASSED**
* `test_group_by_having`: **PASSED**
* `test_composite_order_preservation`: **PASSED**
* `test_invalid_sql`: **PASSED**
* `test_unsupported_sql_type`: **PASSED**
* `test_distinct_and_limit`: **PASSED**

## 13. Security Considerations
* **No Code Execution**: `sqlglot` parses AST structurally. It NEVER invokes `execute()` or interfaces with the database runtime utilizing the user's string context, fully neutralizing SQL injection against the application DB through the analyzer.
* **Read-only validation**: Schema-validation merely verifies presence against ORM cached metrics, it runs no external executions.

## 14. Performance Considerations
* `sqlglot` generates syntax trees in mere milliseconds. No actual database EXPLAIN operations occur yet (reserved for Phase 6 benchmarking).

## 15. Known Limitations
* `SELECT *` wildcard expansion relies on explicit column extractions, implying `*` translates dynamically based on engine rules rather than statically resolving all schema columns dynamically in the UI preview.

## 16. Deferred Phase 4 Functionality
This module identifies `WHERE age > 25 (RANGE)` but does **NOT** yet recommend building an index on `age`.
Scoring, Candidate generation, Index permutations, EXPLAIN fetching, and AI Tutor remain deferred for Phase 4+.
