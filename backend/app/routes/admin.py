from flask import Blueprint, request, jsonify
from .. import db
from ..models import User, HealthRecord, UserSession
from ..utils.auth_utils import admin_required

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    users = User.query.all()
    return jsonify([u.to_dict() for u in users]), 200

@admin_bp.route("/users/<int:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    if user.role == "admin":
        return jsonify({"error": "Cannot delete admin accounts."}), 403
    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": f"User {user_id} deleted."}), 200

@admin_bp.route("/stats", methods=["GET"])
@admin_required
def system_stats():
    return jsonify({
        "total_users":          User.query.count(),
        "total_patients":       User.query.filter_by(role="patient").count(),
        "total_health_records": HealthRecord.query.count(),
        "active_sessions":      UserSession.query.count(),
    }), 200
