# Module 4 / Phase 6: Query Plan & EXPLAIN Analysis Verification

## 1. Files Inspected
- `backend/services/explain_analyzer.py`
- `backend/routers/explain_router.py`
- `backend/schemas.py`
- `backend/tests/test_explain.py`
- `frontend/src/components/Simulation/SimulationSteps.jsx`

## 2. EXPLAIN Architecture
The engine delegates actual query plan execution to the `ExplainAnalyzer` module, using `EXPLAIN FORMAT=TRADITIONAL` concatenated against validated user queries. The AST is analyzed by `sqlglot` prior to transmission to strictly ensure the user is only executing a `SELECT` statement.

## 3. SQL Safety Validation
The system leverages `sqlglot.parse` to evaluate the AST rather than superficial Regex. 
- **Destructive Commands Rejection**: INSERT, UPDATE, DELETE, CREATE, DROP, ALTER, TRUNCATE, RENAME, GRANT are safely rejected since the root AST node is not `exp.Select`.
- **Multi-statement Protection**: The parser splits SQL by semicolons and verifies `len(valid_statements) == 1`. 
- **Nested SELECT**: Validated safely and correctly analyzed by MySQL EXPLAIN.

## 4. Normalized Fields
- All standard EXPLAIN fields (`id`, `select_type`, `table`, `type`, `possible_keys`, `key`, `key_len`, `ref`, `rows`, `filtered`, `Extra`) are consistently mapped, retaining `NULL` values when returned by MySQL without fabricating values.

## 5. Access Type Interpretation
Educational strings exactly match requirements:
- `const` / `system`: MySQL is doing a very selective single-row lookup. Lightning fast.
- `eq_ref`: MySQL is doing an indexed lookup finding one matching row per preceding row in a join (using a PRIMARY KEY or UNIQUE index). Extremely efficient.
- `ref`: MySQL is doing an indexed lookup using a non-unique/reference value. Very efficient.
- `range`: MySQL is using an index range scan. Commonly associated with range predicates (>, <, BETWEEN).
- `index`: MySQL is scanning the entire index tree (full index scan). Slightly faster than ALL, but still expensive.
- `ALL`: MySQL is scanning the entire table (full table scan). This can become very expensive as table size increases.

## 6. possible_keys vs key
- `possible_keys`: Indexes MySQL could potentially use.
- `key`: The index MySQL actually selected for the plan.
The UI strictly maintains this distinction. A new educational note was added directly to the EXPLAIN frontend view to reinforce this concept.

## 7. Five Actual EXPLAIN Cases (Verified on MySQL)
Tested directly against the `users`, `orders`, and `employees` tables on local MySQL instance. 

* **CASE 1 (Primary Key)**: `SELECT * FROM users WHERE id = 3;`
  - table: `users`
  - type: `const`
  - possible_keys: `PRIMARY`
  - key: `PRIMARY`
  - rows: 1
  - filtered: 100.0
  - Extra: None
  - Interpretation: `const` (selective single-row lookup).

* **CASE 2 (Range Index)**: `SELECT * FROM users WHERE age > 25;`
  - table: `users`
  - type: `range`
  - possible_keys: `idx_users_age`
  - key: `idx_users_age`
  - rows: 7
  - filtered: 100.0
  - Extra: `Using index condition`
  - Interpretation: `range` (index range scan).

* **CASE 3 (Composite Index)**: `SELECT * FROM orders WHERE user_id = 1 ORDER BY order_date DESC;`
  - table: `orders`
  - type: `ref`
  - possible_keys: `idx_orders_user_date`
  - key: `idx_orders_user_date`
  - rows: 2
  - filtered: 100.0
  - Extra: `Backward index scan; Using index`
  - Interpretation: `ref` (non-unique index lookup).

* **CASE 4 (JOIN)**: `SELECT u.name, o.order_date FROM users u JOIN orders o ON u.id = o.user_id WHERE u.id = 1;`
  - Row 1: table: `u`, type: `const`, key: `PRIMARY`, rows: 1
  - Row 2: table: `o`, type: `ref`, key: `idx_orders_user_date`, rows: 2, Extra: `Using index`

* **CASE 5 (Low Selectivity)**: `SELECT * FROM users WHERE is_active = TRUE;`
  - table: `users`
  - type: `ALL`
  - possible_keys: None
  - key: None
  - rows: 10
  - filtered: 10.0
  - Extra: `Using where`
  - Interpretation: `ALL` (full table scan).

## 8. API Validation
The API `/api/explain/` handles requests deterministically:
- Valid `SELECT`: HTTP 200
- Destructive/Multi-statement SQL: HTTP 400 (Client Error)
- Missing payload: HTTP 422 (Unprocessable Entity)

## 9. Error Handling
Missing configurations, unavailable database engines, or genuine MySQL execution failures safely route to 400 errors with safe client messages, avoiding raw 500 stack trace leaks. 

## 10. Security
- User SQL executed directly: NO
- Only validated SELECT passed into EXPLAIN: YES
- INSERT/UPDATE/DELETE/CREATE/DROP/ALTER executed: NO
- Automatic index creation: NO
- Database credentials exposed: NO
- AI involved in EXPLAIN execution: NO

## 11. Frontend Integration
Step 9 accurately retrieves the structured EXPLAIN rows. The distinction between `possible_keys` and `key` is labeled and explained. Loading and error states safely handle HTTP edge cases. 

## 12. Recommendation vs EXPLAIN Distinction
The frontend explicitly demarcates the heuristic recommendation (Step 8) from the actual EXPLAIN plan (Step 9), stating that Step 9 reflects the actual MySQL optimizer decision, while Step 8 evaluates deterministic algorithmic suggestions.

## 13. Performance Timing Status
Actual query execution timing: NOT IMPLEMENTED.
The EXPLAIN analysis strictly projects optimizer behavior rather than exposing raw server lock or execution timing vulnerabilities.

## 14. Tests
- `backend/tests/test_explain.py` has been explicitly expanded to cover: Valid nested SELECTs, invalid commands, multi-statements, quoted semicolons, access type string mapping assertions, normalized output structural constraints, empty payloads, and database connection failures. 

## 15. Regression
- `pytest backend/tests/test_explain.py -q`: 9/9 passed.
- `pytest backend/tests/ -q`: 63/63 passed.
- Module 3 tests remain untouched and passing.

## 16. MySQL Verification Status
- Real MySQL EXPLAIN: VERIFIED successfully against a locally connected active test database.

## 17. Issues Found
- The `explain_analyzer.py` did not strictly mirror the requested educational vocabulary for `eq_ref`, `ref`, `range`, `index`, and `ALL`.
- The frontend UI lacked a clear educational explanation of `possible_keys` vs `key`.
- `backend/tests/test_explain.py` required expanded coverage for edge cases like missing parameters, quoted semicolons, and string evaluation.

## 18. Fixes Made
- Updated `explain_analyzer.py` `_interpret_access_type` mappings to exactly match the requested definitions.
- Patched `SimulationSteps.jsx` to output a clear `educational-note` explaining `possible_keys` vs `key`.
- Expanded `test_explain.py` with 5 new targeted unit test definitions.

## 19. Remaining Limitations
- None found related to Module 4 specifications.

## 20. Git Commit Hash
- Will be provided in the final output.

## 21. Final Verdict
PASS
