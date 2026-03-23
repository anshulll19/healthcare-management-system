from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from .config import Config

db = SQLAlchemy()
bcrypt = Bcrypt()
limiter = Limiter(
    key_func=get_remote_address,
    default_limits=["300 per day", "60 per hour"],
    storage_uri="memory://"
)

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    bcrypt.init_app(app)
    limiter.init_app(app)
    CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

    from .routes.auth import auth_bp
    from .routes.health import health_bp
    from .routes.admin import admin_bp
    from .routes.reports import reports_bp

    app.register_blueprint(auth_bp,    url_prefix="/api/auth")
    app.register_blueprint(health_bp,  url_prefix="/api/health")
    app.register_blueprint(admin_bp,   url_prefix="/api/admin")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    return app
