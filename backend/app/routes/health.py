from flask import Blueprint, request, jsonify
from .. import db
from ..models import HealthRecord
from ..utils.auth_utils import login_required, get_current_user

health_bp = Blueprint("health", __name__)

@health_bp.route("/log", methods=["POST"])
# @login_required  <-- Commented for testing your entry module
def log_health():
    try:
        user_id = 1 # Temporary ID for testing without login
        data = request.get_json()
        
        weight         = data.get("weight")
        height         = data.get("height")
        blood_pressure = data.get("blood_pressure")
        blood_sugar    = data.get("blood_sugar")
        
        if not any([weight, height, blood_pressure, blood_sugar]):
            return jsonify({"error": "Provide at least one health metric."}), 400
            
        record = HealthRecord(
            user_id=user_id, 
            weight=weight, 
            height=height, 
            blood_pressure=blood_pressure, 
            blood_sugar=blood_sugar
        )
        db.session.add(record)
        db.session.commit()
        
        return jsonify({"message": "Health data saved.", "record": record.to_dict()}), 201
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to save health data: {str(e)}"}), 500


@health_bp.route("/records", methods=["GET"])
# @login_required  <-- Commented so React can fetch your records
def get_records():
    try:
        user_id = 1 # Temporary ID to match your log_health data
        from_dt = request.args.get("from")
        to_dt   = request.args.get("to")
        
        query   = HealthRecord.query.filter_by(user_id=user_id)
        
        if from_dt:
            query = query.filter(HealthRecord.entry_date >= from_dt)
        if to_dt:
            query = query.filter(HealthRecord.entry_date <= to_dt)
            
        records = query.order_by(HealthRecord.entry_date.desc()).all()
        
        # Returning a direct list so it matches your React fetch call
        return jsonify([r.to_dict() for r in records]), 200
    except Exception as e:
        return jsonify({"error": f"Failed to fetch records: {str(e)}"}), 500


@health_bp.route("/summary", methods=["GET"])
# @login_required
def health_summary():
    try:
        user_id = 1
        records = HealthRecord.query.filter_by(user_id=user_id).order_by(HealthRecord.entry_date.desc()).all()
        
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
    except Exception as e:
        return jsonify({"error": f"Failed to generate summary: {str(e)}"}), 500


@health_bp.route("/records/<int:record_id>", methods=["DELETE"])
# @login_required 
def delete_record(record_id):
    try:
        user_id = 1 # Temporary ID for testing
        record = HealthRecord.query.filter_by(id=record_id, user_id=user_id).first()
        
        if not record:
            return jsonify({"error": "Record not found."}), 404
            
        db.session.delete(record)
        db.session.commit()
        return jsonify({"message": "Record deleted successfully."}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Failed to delete record: {str(e)}"}), 500