# Index Recommendation Engine

## Project Purpose
An interactive educational system that analyzes SQL queries and demonstrates how database indexes can improve query execution. The system parses SQL, checks for existing indexes, recommends new candidate indexes (single or composite) using a heuristic scoring algorithm, and displays query execution plans.

**Note:** This project is currently in **Phase 1 — Project Foundation & Environment Setup**.

## Technology Stack
- **Frontend:** React, Vite, JavaScript, CSS
- **Backend:** Python, FastAPI, Uvicorn
- **Database:** MySQL

## Folder Structure
```text
index-recommendation-engine/
├── frontend/          # React + Vite application
├── backend/           # FastAPI Python application
├── database/          # Database schemas and scripts
├── docs/              # Project architecture and planning docs
├── ai-prompts/        # AI usage logs
├── screenshots/       # Visuals and screenshots
├── test-results/      # Automated test outputs
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
# Edit .env with your MySQL details
```

### 2. Create MySQL Database
Ensure your MySQL server is running and create the database matching your `.env` file:
```sql
CREATE DATABASE index_recommendation_engine;
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

### Test Health Endpoint
To verify the backend and database connection, visit:
```text
http://127.0.0.1:8000/api/health
```

## Current Development Phase
**Phase 1 — Project Foundation & Environment Setup**

### What has NOT been implemented yet:
- SQL parser
- Index recommendation algorithm
- Candidate index generation
- Query optimization logic
- EXPLAIN analysis
- B-tree visualization
- Recommendation scoring
- AI Tutor
- History system
- Report generation
- Advanced UI/Visualizations
