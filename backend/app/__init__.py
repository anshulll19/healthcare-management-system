from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from .config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    
    CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

    from .routes.auth import auth_bp
    from .routes.health import health_bp
    from .routes.admin import admin_bp
    from .routes.reports import reports_bp

    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(health_bp,  url_prefix="/api")
    app.register_blueprint(admin_bp,   url_prefix="/api/admin")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    return app
