import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "ayushcare-secret-2026")
    
    # ✅ Use SQLite (no PostgreSQL issues)
    SQLALCHEMY_DATABASE_URI = "sqlite:///healthcare.db"
    
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = "Lax"
    PERMANENT_SESSION_LIFETIME = timedelta(hours=2)
    BCRYPT_LOG_ROUNDS = 12


class TestingConfig(Config):
    TESTING = True
    SQLALCHEMY_DATABASE_URI = "sqlite:///test.db"
    BCRYPT_LOG_ROUNDS = 4