# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Phase 2 Complete
### Added
- **Database Architecture:** `database/schema.sql` created mapping out schemas, tables, columns, foreign keys, and existing indexes.
- **Backend ORM:** Replaced raw connection handling with SQLAlchemy models (`backend/models.py`) mapping the database structure.
- **Pydantic Validation:** Added `backend/schemas.py` to enforce strict request/response data type validation.
- **Schema API:** `backend/routers/schema_router.py` implemented for full CRUD management of database structures.
- **Frontend UI:** Added `SchemaManager.jsx` providing forms to intuitively build tables, append columns, define FKs, and organize composite indexes.
- **Basic Visualization:** ER-style grid layout applied via CSS to render tables and relationships effectively in the frontend.
- **Tests:** `backend/tests/test_schemas.py` implemented simulating API behavior with SQLite override, covering relationship rules and sequence preservation.
- **Documentation:** Created `docs/phase-2-implementation.md` and updated `README.md`.

## [Phase 1 Complete]
### Added
- Project initialization and basic folder structure (`frontend/`, `backend/`, `docs/`, etc.).
- Frontend setup using React + Vite with placeholder navigation and system status UI.
- Backend setup using Python + FastAPI with CORS configured.
- MySQL connection foundation with environment variable configuration (`.env.example`).
- `/api/health` endpoint implementation.
- Basic automated testing for the backend health endpoint using pytest.
