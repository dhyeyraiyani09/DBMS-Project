# Development Roadmap

## Phase 0: Planning & Architecture (CURRENT)
- **Goal:** Define system architecture, UI/UX, database schema, and project requirements.
- **Output:** Documentation artifacts (`docs/` folder).
- **Rule:** NO implementation code.

## Phase 1: Project Setup
- **Goal:** Initialize Git repository, React frontend, FastAPI backend, and MySQL database connection.
- **Files:** `package.json`, `requirements.txt`, basic `main.py`, React `App.js`.
- **Checkpoint:** Both servers run and communicate (`/api/health` works).

## Phase 2: Database & Schema Module
- **Goal:** Implement Module 1. Build UI and backend APIs to accept, validate, and store schemas.
- **Output:** Schema builder UI, `/api/schemas` endpoints.
- **Checkpoint:** Can successfully save and retrieve a schema.

## Phase 3: SQL Query Analyzer
- **Goal:** Implement Module 2. Integrate SQL parsing library in Python.
- **Output:** Backend logic to extract WHERE, JOIN, ORDER BY, GROUP BY clauses.
- **Checkpoint:** API correctly returns extracted columns from a complex SELECT query.

## Phase 4: Index Recommendation Engine
- **Goal:** Implement Modules 3, 4, 5. The core algorithmic heart of the project.
- **Output:** Candidate generation and heuristic scoring logic.
- **Checkpoint:** Engine correctly recommends a single and composite index based on rules.

## Phase 5: Visualization & Simulation
- **Goal:** Implement Module 7. Build React components for the Simulator UI.
- **Output:** Visual pipeline, score gauge, and parsed SQL highlights.
- **Checkpoint:** UI fully reflects the backend recommendation payload.

## Phase 6: EXPLAIN & Performance Analysis
- **Goal:** Implement Module 6. Connect backend to MySQL to run simulated `EXPLAIN`.
- **Output:** Before/After metric charts in UI.
- **Checkpoint:** EXPLAIN data is correctly fetched and visualized.

## Phase 7: History & Reports
- **Goal:** Implement Modules 8, 9.
- **Output:** History page, PDF/TXT export functionality.
- **Checkpoint:** Can download a complete analysis report.

## Phase 8: Educational Content & Polish
- **Goal:** Implement Module 10 and Day/Night mode.
- **Output:** Learn, Help, Developed By pages. CSS theme variables.
- **Checkpoint:** All mandatory website structures are complete.

## Phase 9: AI Tutor & Innovation
- **Goal:** Implement Module 11 (AI integration for natural language explanation).
- **Output:** AI Tutor component in the Explanation Panel.
- **Checkpoint:** AI accurately explains the *deterministic* recommendation.

## Phase 10: Testing / UI Polish / Finalization
- **Goal:** Prepare for DA1 review.
- **Output:** Comprehensive test coverage, bug fixes, UI tweaks, final AI usage log.
- **Checkpoint:** All 5 demo cases run perfectly. System is robust against edge cases.
