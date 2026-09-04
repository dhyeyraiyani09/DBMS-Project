import logging
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.exc import OperationalError
from .config import config

logger = logging.getLogger(__name__)

# Format: mysql+pymysql://user:password@host:port/database
if config.DB_PASSWORD:
    DATABASE_URL = f"mysql+pymysql://{config.DB_USER}:{config.DB_PASSWORD}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}"
else:
    DATABASE_URL = f"mysql+pymysql://{config.DB_USER}@{config.DB_HOST}:{config.DB_PORT}/{config.DB_NAME}"

# We disable check_same_thread for sqlite, but we use mysql here. 
# We'll allow the engine to be swapped out for testing.
try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True, pool_recycle=3600)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
except Exception as e:
    logger.error(f"Failed to create engine: {e}")
    engine = None
    SessionLocal = None

Base = declarative_base()

def get_db():
    if SessionLocal is None:
        raise RuntimeError("Database engine is not configured.")
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def check_db_connection() -> dict:
    """
    Safely checks the database connection without crashing.
    Returns a dictionary with status details.
    """
    if engine is None:
         return {"status": "disconnected", "message": "Engine not configured."}
         
    try:
        with engine.connect() as connection:
            return {"status": "connected", "message": "Successfully connected to the database."}
    except OperationalError as e:
        logger.warning(f"Database connection failed: {e}")
        return {"status": "disconnected", "message": str(e)}
    except Exception as e:
        logger.warning(f"Database connection failed: {e}")
        return {"status": "disconnected", "message": "Unknown connection issue."}
