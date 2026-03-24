from flask import Blueprint, request, jsonify
from .. import db
from ..models import HealthRecord, ActivityLog
from ..utils.auth_utils import login_required, get_current_user

health_bp = Blueprint("health", __name__)

@health_bp.route("/health/log", methods=["POST"])
@login_required
def log_health():
    user = get_current_user()
    data = request.get_json()
    weight         = data.get("weight")
    height         = data.get("height")
    blood_pressure = data.get("blood_pressure")
    blood_sugar    = data.get("blood_sugar")

    if weight is not None and (float(weight) <= 0 or float(weight) > 500):
        return jsonify({"error": "Invalid weight."}), 400
    if height is not None and (float(height) <= 0 or float(height) > 300):
        return jsonify({"error": "Invalid height."}), 400
    if blood_sugar is not None and (int(blood_sugar) <= 0 or int(blood_sugar) > 1000):
        return jsonify({"error": "Invalid blood sugar."}), 400
    if blood_pressure is not None:
        import re
        if not re.match(r"^\d{2,3}/\d{2,3}$", blood_pressure):
            return jsonify({"error": "Invalid blood pressure format."}), 400

    if not any([weight, height, blood_pressure, blood_sugar]):
        return jsonify({"error": "Provide at least one health metric."}), 400

    record = HealthRecord(user_id=user.id, weight=weight, height=height, blood_pressure=blood_pressure, blood_sugar=blood_sugar)
    db.session.add(record)
    log = ActivityLog(user_id=user.id, action="Logged new health vitals via API")
    db.session.add(log)
    db.session.commit()
    return jsonify({"message": "Health data saved.", "record": record.to_dict()}), 201

@health_bp.route("/records", methods=["GET"])
@login_required
def get_records():
    user = get_current_user()
    records = HealthRecord.query.filter_by(user_id=user.id).order_by(HealthRecord.created_at.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200

@health_bp.route("/summary", methods=["GET"])
@login_required
def health_summary():
    user = get_current_user()
    records = HealthRecord.query.filter_by(user_id=user.id).order_by(HealthRecord.created_at.desc()).all()
    if not records:
        return jsonify({"message": "No health data found.", "summary": {}}), 200
    weights = [float(r.weight) for r in records if r.weight]
    sugars  = [r.blood_sugar for r in records if r.blood_sugar]
    summary = {
        "total_records":   len(records),
        "latest_entry":    records[0].to_dict(),
        "avg_weight_kg":   round(sum(weights) / len(weights), 2) if weights else None,
        "avg_blood_sugar": round(sum(sugars)  / len(sugars),  2) if sugars  else None,
        "weight_trend":    [{"date": r.created_at.strftime("%Y-%m-%d %H:%M:%S"), "weight": float(r.weight)} for r in reversed(records) if r.weight],
    }
    return jsonify(summary), 200

@health_bp.route("/records/<int:record_id>", methods=["DELETE"])
@login_required
def delete_record(record_id):
    user = get_current_user()
    record = HealthRecord.query.filter_by(id=record_id, user_id=user.id).first()
    if not record:
        return jsonify({"error": "Record not found."}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Record deleted."}), 200

@health_bp.route("/health/report", methods=["GET"])
@login_required
def get_report():
    user = get_current_user()
    records = HealthRecord.query.filter_by(user_id=user.id).all()
    logs = ActivityLog.query.filter_by(user_id=user.id).order_by(ActivityLog.created_at.desc()).limit(5).all()
    return jsonify({
        "total_records": len(records),
        "total_logs": len(logs),
        "recent_activity": [l.to_dict() for l in logs] if logs else [],
        "system_status": "Active",
        "health_trend": "Stable"
    }), 200

# End of health blueprint
