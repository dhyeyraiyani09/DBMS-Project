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
- Navigate to **SQL Analyzer** to enter a query and analyze its structured AST components.

### Test Health Endpoint
```text
http://127.0.0.1:8000/api/health
```

## Current Development Phase
**Phase 3 — SQL Query Analyzer**

*Note: The current SQL Query Analyzer identifies query structure and parses semantics. It does NOT yet score or recommend new indexes.*

### What has NOT been implemented yet:
- Index candidate generation & recommendation scoring (Phase 4)
- Query optimization logic & EXPLAIN analysis
- B-tree visualization
- AI Tutor & History system
