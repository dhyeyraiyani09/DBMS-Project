from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import config
from .database import check_db_connection, Base, engine
from .routers import schema_router, query_router, recommendation_router, explain_router, history_router

# Create tables if they don't exist (useful for dev/sqlite but we rely on schema.sql for MySQL)
if engine and engine.url.drivername == "sqlite":
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
