import mysql.connector
from mysql.connector import Error
from .config import config
import logging

logger = logging.getLogger(__name__)

def check_db_connection() -> dict:
    """
    Safely checks the MySQL database connection without crashing.
    Returns a dictionary with status details.
    """
    connection = None
    try:
        connection = mysql.connector.connect(
            host=config.DB_HOST,
            port=config.DB_PORT,
            user=config.DB_USER,
            password=config.DB_PASSWORD,
            database=config.DB_NAME,
            connection_timeout=2
        )
        if connection.is_connected():
            return {"status": "connected", "message": "Successfully connected to the database."}
    except Error as e:
        logger.warning(f"Database connection failed: {e}")
        return {"status": "disconnected", "message": str(e)}
    finally:
        if connection and connection.is_connected():
            connection.close()
    
    return {"status": "disconnected", "message": "Unknown connection issue."}
