# Testing Strategy & Error Handling

## 1. Testing Strategy

### 1.1 Unit Tests (Backend - Python/Pytest)
- **SQL Parser:** Test extraction of columns from complex queries (nested SELECTs, multiple JOINs).
- **Candidate Generator:** Assert correct candidates are generated for given clauses.
- **Scoring Engine:** Feed mock candidates and assert the correct heuristic score is calculated based on rules.
- **Existing Index Detection:** Test penalty application when redundant indexes are proposed.

### 1.2 Integration Tests
- **Frontend -> API:** Mock API responses and ensure React UI updates correctly (score gauges, tables).
- **API -> MySQL:** Ensure the system can create temporary schema setups, run EXPLAIN, and rollback cleanly.
- **EXPLAIN Workflow:** End-to-end test verifying that EXPLAIN diffs are correctly parsed and returned to the client.

### 1.3 UI Tests (Frontend - Jest/Cypress)
- **Navigation:** Ensure routing between Simulator, Learn, History, etc., works.
- **Forms:** Test schema input validation (e.g., preventing empty table names).
- **Theme Switching:** Verify CSS variable changes on Day/Night toggle.
- **Download:** Assert report generation triggers file download.

### 1.4 Edge Cases
- Invalid SQL syntax.
- Empty input fields.
- Duplicate existing index definitions.
- Missing schema context for a query.
- Very large queries or schemas (stress testing).

## 2. Error Handling Design

The system must handle errors gracefully with user-friendly messages, avoiding raw stack traces.

- **Empty SQL:** "Please provide an SQL query to analyze."
- **Invalid SQL:** "Syntax error in SQL query. Please check your query near '...'."
- **Unknown Table/Column:** "Column 'X' not found in table 'Y'. Please check your schema."
- **Duplicate Columns:** "Schema error: Column 'X' is defined multiple times."
- **Duplicate Indexes:** "Warning: The existing index 'X' is duplicated."
- **Unsupported SQL Syntax:** "This tool currently supports SELECT queries. Updates/Deletes are not yet supported."
- **Database Connection Failure:** "Unable to connect to the analysis engine. Please try again later."
- **EXPLAIN Failure:** "Could not generate execution plan. Ensure your schema matches the query."
- **Report Generation Failure:** "Failed to generate report. Please try again."
