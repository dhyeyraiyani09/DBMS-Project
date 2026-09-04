# Index Recommendation Engine

## Project Purpose
An interactive educational system that analyzes SQL queries and demonstrates how database indexes can improve query execution. The system parses SQL, checks for existing indexes, recommends new candidate indexes (single or composite) using a heuristic scoring algorithm, and displays query execution plans.

## Technology Stack
- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, Uvicorn, SQLAlchemy
- **Database:** MySQL
- **SQL Parser:** sqlglot

## Folder Structure
```text
index-recommendation-engine/
├── frontend/          # React + Vite application
├── backend/           # FastAPI Python application (Models, Routers, Schemas, Services)
├── database/          # Database SQL scripts (schema.sql)
├── docs/              # Project architecture and planning docs
```

## Prerequisites
- Node.js (v18+)
- Python (3.9+)
- MySQL Server (8.0+)

## Installation & Setup

### 1. Configure Environment
Copy the example environment file and configure your MySQL credentials:
```bash
cp .env.example .env
```

### 2. Create MySQL Database & Schema
Ensure your MySQL server is running and load the Phase 2 schema:
```bash
mysql -u root -p < database/schema.sql
```

### 3. Install Backend Dependencies
```bash
python -m venv .venv
source .venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Install Frontend Dependencies
```bash
cd frontend
npm install
```

## Running the Application

### Start the Backend
Open a terminal, activate your virtual environment, and run:
```bash
source .venv/bin/activate
uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

### Start the Frontend
Open another terminal and run:
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`. 
- Navigate to **Schema Management** to create your mock database architectures.
- Navigate to **SQL Analyzer** to enter a query, parse its AST, and request heuristic-based Index Recommendations.

### Test Health Endpoint
```text
http://127.0.0.1:8000/api/health
```

## Current Development Phase
**Phase 7 — History & Reports**

Phase 5 introduces a robust React-driven interactive simulation pipeline, transforming the deterministic index recommendations into an educational step-by-step visualizer. It displays exactly how operations are detected, how candidates are scored, explains left-prefix coverages, and visualizes optimal composite ordering combinations.
Phase 6 seamlessly integrates actual MySQL EXPLAIN metrics enforcing stringent safety protocols to allow transparent optimizer projection comparing deterministic heuristics against true execution plans natively.
Phase 7 introduces complete persistent session tracking and professional reporting pipelines generating server-side PDF, DOCX, and TXT analytics isolating stored algorithms seamlessly.




### What has NOT been implemented yet:
- Query optimization logic & EXPLAIN analysis (Phase 6)
- AI Tutor & History system (Phase 7-9)
