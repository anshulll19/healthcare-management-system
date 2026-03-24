from datetime import datetime
from . import db

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(120), nullable=False)
    email         = db.Column(db.String(200), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    role          = db.Column(db.Enum("patient", "admin", name="user_role"), nullable=False, default="patient")
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)
    health_records = db.relationship("HealthRecord", backref="user", lazy=True, cascade="all, delete-orphan")
    sessions       = db.relationship("UserSession", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self):
        return {"id": self.id, "name": self.name, "email": self.email, "role": self.role, "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")}

class HealthRecord(db.Model):
    __tablename__ = "health_records"
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    created_at     = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)
    weight         = db.Column(db.Numeric(5, 2))
    height         = db.Column(db.Numeric(5, 2))
    blood_pressure = db.Column(db.String(20))
    blood_sugar    = db.Column(db.Integer)

    def to_dict(self):
        return {"id": self.id, "user_id": self.user_id, "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S"), "weight": float(self.weight) if self.weight else None, "height": float(self.height) if self.height else None, "blood_pressure": self.blood_pressure, "blood_sugar": self.blood_sugar}

class UserSession(db.Model):
    __tablename__ = "sessions"
    session_id  = db.Column(db.String(128), primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    expiry_time = db.Column(db.DateTime, nullable=False)
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)

    def is_valid(self):
        return datetime.utcnow() < self.expiry_time

class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    action        = db.Column(db.String(255), nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "action": self.action,
            "created_at": self.created_at.strftime("%Y-%m-%d %H:%M:%S")
        }
