import functools
from flask import jsonify, request, session
from app.models import User

def login_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        role = session.get("role")
        if role != "patient" and "/health/" in request.path:
            return jsonify({"error": "Forbidden. Patient access only."}), 403
            
        return func(*args, **kwargs)
    return wrapper

def patient_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        role = session.get("role")
        if role != "patient":
            return jsonify({"error": "Forbidden. Patient access only."}), 403
            
        return func(*args, **kwargs)
    return wrapper

def admin_required(func):
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        if "user_id" not in session:
            return jsonify({"error": "Unauthorized"}), 401
            
        if session.get("role") != "admin":
            return jsonify({"error": "Forbidden. Admin access only."}), 403
            
        return func(*args, **kwargs)
    return wrapper

def get_current_user():
    user_id = session.get("user_id")
    if not user_id:
        return None
    return User.query.get(user_id)