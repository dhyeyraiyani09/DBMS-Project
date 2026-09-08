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

## Implemented Features

This project is fully implemented and includes:
- **Schema Management:** Create and manage mock database architectures.
- **SQL Analyzer:** Parses SQL into AST using `sqlglot` to prevent injection.
- **Index Recommendation Engine:** Deterministic heuristic scoring (Equality +30, JOIN +25, Range +20, ORDER BY +20) mapping candidate B-Tree index improvements.
- **Interactive Simulation:** 10-step visual pipeline illustrating the index mapping.
- **MySQL EXPLAIN Integration:** Runs the query against MySQL EXPLAIN to display real optimizer behavior without executing modifications.
- **History & Reports:** Fully persists analysis timelines generating dynamic PDF, DOCX, and TXT analytics.
- **AI Tutor:** Contextual Gemini-powered guidance natively augmenting deterministic steps.
- **Educational Modules:** Robust Learn platform, Help manual, Day/Night theme toggling, and Accessibility scaling.
