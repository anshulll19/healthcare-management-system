import uuid
import functools
from datetime import datetime, timedelta
from flask import jsonify, request
from app import bcrypt, db
from app.models import UserSession


def hash_password(plain):
    return bcrypt.generate_password_hash(plain).decode("utf-8")


def check_password(plain, hashed):
    return bcrypt.check_password_hash(hashed, plain)


def create_session(user_id, hours=2):
    token = str(uuid.uuid4())
    expiry = datetime.utcnow() + timedelta(hours=hours)
    sess = UserSession(session_id=token, user_id=user_id, expiry_time=expiry)
    db.session.add(sess)
    db.session.commit()
    return token


def invalidate_session(token):
    sess = UserSession.query.get(token)
    if sess:
        db.session.delete(sess)
        db.session.commit()


def get_current_user():
    """Read session_token cookie → validate DB session → return User or None."""
    token = request.cookies.get("session_token")
    if not token:
        return None
    sess = UserSession.query.get(token)
    if not sess or not sess.is_valid():
        return None
    return sess.user


def login_required(f):
    """Decorator: blocks unauthenticated requests using DB session tokens."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized."}), 401
        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    """Decorator: blocks non-admin requests."""
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized."}), 401
        if user.role != "admin":
            return jsonify({"error": "Forbidden. Admin access only."}), 403
        return f(*args, **kwargs)
    return decorated
