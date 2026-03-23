import re
from flask import Blueprint, request, jsonify
from .. import db
from ..models import HealthRecord
from ..utils.auth_utils import login_required, get_current_user

health_bp = Blueprint("health", __name__)

# Blood pressure must match "120/80" format
BP_PATTERN = re.compile(r'^\d{2,3}/\d{2,3}$')


def _validate_vitals(data):
    """Returns (weight, height, bp, sugar, error_message)."""
    weight         = data.get("weight")
    height         = data.get("height")
    blood_pressure = data.get("blood_pressure")
    blood_sugar    = data.get("blood_sugar")

    if not any([weight, height, blood_pressure, blood_sugar]):
        return None, None, None, None, "Provide at least one health metric."

    if blood_pressure and not BP_PATTERN.match(str(blood_pressure)):
        return None, None, None, None, "Blood pressure must be in 'systolic/diastolic' format, e.g. 120/80."

    if blood_sugar is not None:
        try:
            blood_sugar = int(blood_sugar)
            if blood_sugar < 0:
                raise ValueError
        except (ValueError, TypeError):
            return None, None, None, None, "Blood sugar must be a non-negative integer."

    return weight, height, blood_pressure, blood_sugar, None


# ── LOG HEALTH DATA ───────────────────────────────────────────────────────────
@health_bp.route("/log", methods=["POST"])
@login_required
def log_health():
    user = get_current_user()
    if user.role == "admin":
        return jsonify({"error": "Admins cannot log health data."}), 403

    data = request.get_json() or {}
    weight, height, blood_pressure, blood_sugar, err = _validate_vitals(data)
    if err:
        return jsonify({"error": err}), 400

    record = HealthRecord(
        user_id=user.id, weight=weight, height=height,
        blood_pressure=blood_pressure, blood_sugar=blood_sugar
    )
    db.session.add(record)
    db.session.commit()
    return jsonify({"message": "Health data saved successfully.", "record": record.to_dict()}), 201


# ── GET ALL RECORDS ───────────────────────────────────────────────────────────
@health_bp.route("/records", methods=["GET"])
@login_required
def get_records():
    user = get_current_user()
    if user.role == "admin":
        return jsonify({"error": "Admins cannot access patient health data."}), 403

    from_dt = request.args.get("from")
    to_dt   = request.args.get("to")
    query   = HealthRecord.query.filter_by(user_id=user.id)
    if from_dt:
        query = query.filter(HealthRecord.entry_date >= from_dt)
    if to_dt:
        query = query.filter(HealthRecord.entry_date <= to_dt)
    records = query.order_by(HealthRecord.entry_date.desc()).all()
    return jsonify([r.to_dict() for r in records]), 200


# ── UPDATE A RECORD ───────────────────────────────────────────────────────────
@health_bp.route("/records/<int:record_id>", methods=["PUT"])
@login_required
def update_record(record_id):
    user   = get_current_user()
    record = HealthRecord.query.filter_by(id=record_id, user_id=user.id).first()
    if not record:
        return jsonify({"error": "Record not found."}), 404

    data = request.get_json() or {}
    _, _, _, _, err = _validate_vitals({**{
        "weight": record.weight, "height": record.height,
        "blood_pressure": record.blood_pressure, "blood_sugar": record.blood_sugar
    }, **{k: v for k, v in data.items() if v is not None}})
    if err:
        return jsonify({"error": err}), 400

    if data.get("weight")         is not None: record.weight         = data["weight"]
    if data.get("height")         is not None: record.height         = data["height"]
    if data.get("blood_pressure") is not None: record.blood_pressure = data["blood_pressure"]
    if data.get("blood_sugar")    is not None: record.blood_sugar    = data["blood_sugar"]
    db.session.commit()
    return jsonify({"message": "Record updated.", "record": record.to_dict()}), 200


# ── DELETE A RECORD ───────────────────────────────────────────────────────────
@health_bp.route("/records/<int:record_id>", methods=["DELETE"])
@login_required
def delete_record(record_id):
    user   = get_current_user()
    record = HealthRecord.query.filter_by(id=record_id, user_id=user.id).first()
    if not record:
        return jsonify({"error": "Record not found."}), 404
    db.session.delete(record)
    db.session.commit()
    return jsonify({"message": "Record deleted."}), 200


# ── HEALTH SUMMARY ────────────────────────────────────────────────────────────
@health_bp.route("/summary", methods=["GET"])
@login_required
def health_summary():
    user = get_current_user()
    if user.role == "admin":
        return jsonify({"error": "Admins cannot access patient health data."}), 403

    records = HealthRecord.query.filter_by(user_id=user.id).order_by(HealthRecord.entry_date.desc()).all()
    if not records:
        return jsonify({"message": "No health data found.", "summary": {}}), 200

    weights = [float(r.weight) for r in records if r.weight]
    sugars  = [r.blood_sugar   for r in records if r.blood_sugar]
    summary = {
        "total_records":   len(records),
        "latest_entry":    records[0].to_dict(),
        "avg_weight_kg":   round(sum(weights) / len(weights), 2) if weights else None,
        "avg_blood_sugar": round(sum(sugars)  / len(sugars),  2) if sugars  else None,
        "weight_trend":    [{"date": r.entry_date.isoformat(), "weight": float(r.weight)} for r in reversed(records) if r.weight],
    }
    return jsonify(summary), 200