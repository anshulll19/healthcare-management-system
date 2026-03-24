from app import create_app, db
from app.models import User, HealthRecord, ActivityLog
import datetime

app = create_app()

with app.app_context():
    db.create_all()
    from flask_bcrypt import Bcrypt
    bcrypt = Bcrypt()
    
    user = User.query.filter_by(email="admin@lumina.com").first()
    if not user:
        hashed = bcrypt.generate_password_hash("password123").decode("utf-8")
        user = User(name="Dr. Aris", email="admin@lumina.com", password_hash=hashed, role="admin")
        db.session.add(user)
        db.session.commit()
    
    # Add records if empty
    records = HealthRecord.query.filter_by(user_id=user.id).all()
    if not records:
        for i in range(5):
            r = HealthRecord(
                user_id=user.id,
                weight=70 + i,
                height=175,
                blood_pressure="120/80",
                blood_sugar=90 + i*2,
                created_at=datetime.datetime.utcnow() - datetime.timedelta(days=5-i)
            )
            db.session.add(r)
            db.session.add(ActivityLog(user_id=user.id, action="Logged new health vitals via API", created_at=r.created_at))
        db.session.commit()
        print("Database seeded with user: admin@lumina.com / password123 and 5 health records.")
    else:
        print("Records already exist.")
