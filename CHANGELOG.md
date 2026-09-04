# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased] - Phase 4 Complete

## [Phase 7 Complete]
### Added
- **History Storage:** Added `analysis_history` SQL table persisting JSON dumps of heuristic recommendations and MySQL physical execution plans safely.
- **Reporting Engine:** Integrated `fpdf2` and `python-docx` backend microservices generating professional TXT, DOCX, and PDF analytics natively.
- **History UI Integration:** Updated `QueryAnalyzer.jsx` to dynamically push analysis caches into history storage, and created `HistoryPage.jsx` visualizing historical payload strings.


## [Phase 6 Complete]
### Added
- **EXPLAIN API Engine:** Implemented `/api/explain/` securely proxying SELECT-only queries via PyMySQL leveraging AST validation bounds preventing destructive payload execution natively.
- **Normalization Layer:** Added educational `type` interpretations evaluating physical MySQL optimizer plans (const, eq_ref, ALL, range).
- **Visualization Step:** Integrated EXPLAIN Step 9 into `SimulationSteps.jsx` natively parsing query components distinguishing explicitly between Heuristic Suggestions and physical optimizer paths.
- **Documentation:** Created `phase-6-implementation.md` enforcing explicitly transparent execution boundaries.


## [Phase 5 Complete]
### Added
- **Simulation Orchestrator:** Implemented `SimulationPipeline.jsx` managing an interactive 9-step educational visualization state machine.
- **Simulation Control Suite:** Implemented `SimulationControls.jsx` providing granular Next, Previous, Reset, and Autoplay pipeline traversal.
- **Step Visualizations:** Componentized independent educational steps (`SimulationSteps.jsx`) dynamically rendering Phase 3 and Phase 4 AST/Scoring metadata arrays strictly as visual blocks.
- **Educational Deep Dive:** Rendered conceptual ASCII B-tree and composite (Equality -> Ordering -> Range) flexbox architectures.
- **Existing Index Visualizer:** Mapped real schema tables dynamically showing left-prefix redundancy relationships and error badges.
- **Score Breakdown UI:** Rendered positive/negative score constants precisely mapping Phase 4 factor evaluations.
- **Documentation:** Created `docs/phase-5-implementation.md` and updated existing visualization schemas.

### Added
- **Recommendation Engine Service:** Developed `backend/services/recommendation_engine.py` parsing query structure outputs dynamically against schema models.
- **API Endpoint:** Implemented `POST /api/recommendations` generating deterministic candidate rules arrays.
- **Candidate Generator:** Merges query clauses into targeted table tuples. 
- **Composite Index Ordering:** Implemented `Equality -> Group/Order -> Range` preservation logic enforcing b-tree optimal sequence extraction.
- **Heuristic Scoring System:** Maps explicit factor values scaling candidates dynamically (e.g., Equality: +30, Range: +20) alongside penalties for redundancies.
- **Redundancy Validation Engine:** Maps candidate outputs directly against Phase 2 Schema caching, verifying prefix coverages and primary key redundancies before allowing recommendations.
- **Frontend Extension:** `QueryAnalyzer.jsx` upgraded to capture and cleanly format recommendations highlighting exact factor reasons, rendering rejected candidates and prefix matches securely in separate views.
- **Tests:** `backend/tests/test_recommendation_engine.py` configured enforcing composite generation pipelines and selectivity validations deterministically.
- **Documentation:** Authored `docs/phase-4-implementation.md`. Updated API and README scopes.

## [Phase 3 Complete]
### Added
- **SQL Parser Integration:** Added `sqlglot` dependency for deterministic AST parsing of MySQL statements.
- **Query Analysis Service:** `backend/services/query_analyzer.py` safely extracts semantics.
- **SQL Validation:** Invalid queries trigger structured 400 responses preventing blind stack traces.
- **Schema-Aware Validation:** Endpoint cross-references parsed tables/columns with database `schemas_def` ORM records rejecting invalid references dynamically.
- **API Endpoint:** Added `POST /api/queries/analyze` generating deterministic structure.
- **Frontend UI:** Integrated `QueryAnalyzer.jsx` enabling intuitive query entering.
- **Tests:** `backend/tests/test_analyzer.py` implemented verifying predicate ordering and parsing edge cases.
- **Documentation:** Created `docs/phase-3-implementation.md` and updated `api-design.md`/`README.md`.

## [Phase 2 Complete]
### Added
- Phase 2 MySQL Verification Audit Report.
- **Database Architecture:** `database/schema.sql` created mapping out schemas, tables, columns, foreign keys, and existing indexes.
- **Backend ORM:** Replaced raw connection handling with SQLAlchemy models (`backend/models.py`).
- **Pydantic Validation:** Added `backend/schemas.py`.
- **Schema API:** `backend/routers/schema_router.py`.
- **Frontend UI:** Added `SchemaManager.jsx`.
- **Basic Visualization:** ER-style grid layout applied via CSS to render tables and relationships.
- **Tests:** `backend/tests/test_schemas.py`.
- **Documentation:** Created `docs/phase-2-implementation.md` and updated `README.md`.

## [Phase 1 Complete]
### Added
- Project initialization and basic folder structure.
- Frontend setup using React + Vite.
- Backend setup using Python + FastAPI with CORS configured.
- MySQL connection foundation with environment variable configuration.
- `/api/health` endpoint implementation.
- Basic automated testing for the backend health endpoint using pytest.
