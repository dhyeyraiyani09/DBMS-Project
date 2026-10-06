import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

class Config:
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_USER = os.getenv("DB_USER", "root")
    DB_PASSWORD = os.getenv("DB_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "index_recommendation_engine")
    # Expected to be the raw CA certificate PEM string (e.g., for Vercel deployment)
    DB_SSL_CA = os.getenv("DB_SSL_CA", "")
    FRONTEND_URL = os.getenv("FRONTEND_URL", "")
    
    CORS_ORIGINS = [
        "http://localhost:5173", # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        ]
    if FRONTEND_URL:
        for url in FRONTEND_URL.split(","):
            clean_url = url.strip().rstrip("/")
            if clean_url:
                CORS_ORIGINS.append(clean_url)

config = Config()
