from flask import Blueprint, request, jsonify, make_response
from .. import db
from ..models import User
from ..utils.auth_utils import hash_password, check_password, create_session, invalidate_session, get_current_user, login_required

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    name  = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    pwd   = data.get("password", "")
    if not name or not email or not pwd:
        return jsonify({"error": "Name, email and password are required."}), 400
    if len(pwd) < 8:
        return jsonify({"error": "Password must be at least 8 characters."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already registered."}), 409
    user = User(name=name, email=email, password_hash=hash_password(pwd))
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Registration successful.", "user": user.to_dict()}), 201

@auth_bp.route("/login", methods=["POST"])
def login():
    data  = request.get_json()
    email = (data.get("email") or "").strip().lower()
    pwd   = data.get("password", "")
    user  = User.query.filter_by(email=email).first()
    if not user or not check_password(pwd, user.password_hash):
        return jsonify({"error": "Invalid email or password."}), 401
    token = create_session(user.id)
    resp  = make_response(jsonify({"message": "Login successful.", "user": user.to_dict()}))
    resp.set_cookie("session_token", token, httponly=True, samesite="Lax", max_age=7200)
    return resp, 200

@auth_bp.route("/logout", methods=["POST"])
@login_required
def logout():
    token = request.cookies.get("session_token")
    invalidate_session(token)
    resp = make_response(jsonify({"message": "Logged out."}))
    resp.delete_cookie("session_token")
    return resp, 200

@auth_bp.route("/me", methods=["GET"])
@login_required
def me():
    user = get_current_user()
    return jsonify(user.to_dict()), 200
