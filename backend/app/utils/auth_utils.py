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
    token = request.cookies.get("session_token")
    if not token:
        return None
    sess = UserSession.query.get(token)
    if not sess or not sess.is_valid():
        return None
    return sess.user

def admin_required(f):
    @functools.wraps(f)
    def decorated(*args, **kwargs):
        user = get_current_user()
        if not user:
            return jsonify({"error": "Unauthorized."}), 401
        if user.role != "admin":
            return jsonify({"error": "Forbidden. Admin access only."}), 403
        return f(*args, **kwargs)
    return decorated

from flask import session, jsonify
from functools import wraps

def login_required(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"message": "Unauthorized"}), 401
        return func(*args, **kwargs)
    return wrapper