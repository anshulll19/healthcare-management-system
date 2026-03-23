from flask import Blueprint, request, jsonify, make_response
from .. import db, bcrypt, limiter
from ..models import User
from ..utils.auth_utils import create_session, invalidate_session, get_current_user

auth_bp = Blueprint("auth", __name__)


# ── REGISTER ──────────────────────────────────────────────────────────────────
@auth_bp.route("/register", methods=["POST"])
@limiter.limit("5 per minute")
def register():
    data     = request.get_json() or {}
    name     = data.get("name", "").strip()
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not name or not email or not password:
        return jsonify({"message": "All fields are required."}), 400
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters."}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists."}), 400

    hashed = bcrypt.generate_password_hash(password).decode("utf-8")
    user   = User(name=name, email=email, password_hash=hashed)
    db.session.add(user)
    db.session.commit()
    return jsonify({"message": "Registered successfully. Please log in."}), 201


# ── LOGIN ─────────────────────────────────────────────────────────────────────
@auth_bp.route("/login", methods=["POST"])
@limiter.limit("10 per minute")
def login():
    data     = request.get_json() or {}
    email    = data.get("email", "").strip().lower()
    password = data.get("password", "")

    user = User.query.filter_by(email=email).first()
    if user and bcrypt.check_password_hash(user.password_hash, password):
        token = create_session(user.id)
        resp  = make_response(jsonify({"message": "Login successful", "user": user.to_dict()}))
        resp.set_cookie(
            "session_token", token,
            httponly=True, samesite="Lax", max_age=7200
        )
        return resp

    return jsonify({"message": "Invalid credentials."}), 401


# ── ME (current session check) ────────────────────────────────────────────────
@auth_bp.route("/me", methods=["GET"])
def me():
    user = get_current_user()
    return jsonify({"user": user.to_dict() if user else None}), 200


# ── LOGOUT ────────────────────────────────────────────────────────────────────
@auth_bp.route("/logout", methods=["POST"])
def logout():
    token = request.cookies.get("session_token")
    if token:
        invalidate_session(token)
    resp = make_response(jsonify({"message": "Logged out."}))
    resp.delete_cookie("session_token")
    return resp
