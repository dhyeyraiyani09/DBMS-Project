import sys
import os

# Fix for Vercel deployment: create a virtual 'backend' package
# when Vercel sets the Root Directory to 'backend'.
if "backend" not in sys.modules:
    import types
    backend_pkg = types.ModuleType("backend")
    backend_pkg.__path__ = [os.path.dirname(os.path.abspath(__file__))]
    backend_pkg.__package__ = "backend"
    sys.modules["backend"] = backend_pkg
    __package__ = "backend"

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import config
from .database import check_db_connection, Base, engine
from .routers import schema_router, query_router, recommendation_router, explain_router, history_router, ai_router

# Automatically initialize missing application tables (supports Aiven MySQL and SQLite)
# Base.metadata.create_all safely uses 'CREATE TABLE IF NOT EXISTS' so it will not drop existing data.
if engine:
    Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Index Recommendation Engine API",
    description="Backend API for the Index Recommendation Engine simulator.",
    version="1.0.0",
)

# Set up CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(schema_router.router)
app.include_router(query_router.router)
app.include_router(recommendation_router.router)
app.include_router(explain_router.router)
app.include_router(ai_router.router)

app.include_router(history_router.router)





@app.get("/api/health")
def health_check():
    """
    Basic health check endpoint that also verifies database connectivity.
    """
    db_status = check_db_connection()
    return {
        "status": "ok",
        "service": "index-recommendation-engine",
        "database": db_status["status"],
        "database_message": db_status["message"]
    }
