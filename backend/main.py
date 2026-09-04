from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import config
from .database import check_db_connection

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
