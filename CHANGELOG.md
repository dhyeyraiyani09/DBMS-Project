# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Phase 3 Complete
### Added
- **SQL Parser Integration:** Added `sqlglot` dependency for deterministic AST parsing of MySQL statements.
- **Query Analysis Service:** `backend/services/query_analyzer.py` safely extracts semantics (Tables, Aliases, WHERE clauses, predicates, JOINs, Group/Order By constraints).
- **SQL Validation:** Invalid queries trigger structured 400 responses preventing blind stack traces. Rejects non-SELECT queries.
- **Schema-Aware Validation:** Endpoint cross-references parsed tables/columns with database `schemas_def` ORM records rejecting invalid references dynamically.
- **API Endpoint:** Added `POST /api/queries/analyze` generating deterministic Phase-4-ready structure.
- **Frontend UI:** Integrated `QueryAnalyzer.jsx` enabling intuitive query entering, schema selection, and visual parsed-component previews.
- **Tests:** `backend/tests/test_analyzer.py` implemented verifying predicate ordering and parsing edge cases.
- **Documentation:** Created `docs/phase-3-implementation.md` and updated `api-design.md`/`README.md`.

## [Phase 2 Complete]
### Added
- Phase 2 MySQL Verification Audit Report (`docs/phase-2-mysql-verification.md`).
- **Database Architecture:** `database/schema.sql` created mapping out schemas, tables, columns, foreign keys, and existing indexes.
- **Backend ORM:** Replaced raw connection handling with SQLAlchemy models (`backend/models.py`) mapping the database structure.
- **Pydantic Validation:** Added `backend/schemas.py` to enforce strict request/response data type validation.
- **Schema API:** `backend/routers/schema_router.py` implemented for full CRUD management of database structures.
- **Frontend UI:** Added `SchemaManager.jsx` providing forms to intuitively build tables, append columns, define FKs, and organize composite indexes.
- **Basic Visualization:** ER-style grid layout applied via CSS to render tables and relationships effectively in the frontend.
- **Tests:** `backend/tests/test_schemas.py` implemented simulating API behavior with SQLite override, covering relationship rules and sequence preservation.
- **Documentation:** Created `docs/phase-2-implementation.md` and updated `README.md`.
### Fixed
- Fixed automated testing suite bug where `sqlite:///:memory:` dropped metadata between test steps by introducing `StaticPool` to the test engine in `backend/tests/test_schemas.py`.

## [Phase 1 Complete]
### Added
- Project initialization and basic folder structure (`frontend/`, `backend/`, `docs/`, etc.).
- Frontend setup using React + Vite with placeholder navigation and system status UI.
- Backend setup using Python + FastAPI with CORS configured.
- MySQL connection foundation with environment variable configuration (`.env.example`).
- `/api/health` endpoint implementation.
- Basic automated testing for the backend health endpoint using pytest.
