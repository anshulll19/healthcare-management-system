from flask import Blueprint, request, jsonify, session
from app import db
from app.models import User
from flask_bcrypt import Bcrypt

auth_bp = Blueprint("auth", __name__)
bcrypt = Bcrypt()

# REGISTER
@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name")
    email = data.get("email")
    password = data.get("password")

    # check if user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"message": "User already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8")

    user = User(name=name, email=email, password_hash=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({"message": "User registered successfully"})


# LOGIN
@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email")
    password = data.get("password")

    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        session["user_id"] = user.id
        return jsonify({"message": "Login successful"})

    return jsonify({"message": "Invalid credentials"}), 401


# LOGOUT
@auth_bp.route("/logout", methods=["GET"])
def logout():
    session.pop("user_id", None)
    return jsonify({"message": "Logged out"})