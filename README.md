# AyushCare — AI Smart Healthcare Assistance for Bharat
**Team MedNexus** — University of Delhi, Dept. of Computer Engineering, Feb 2026

| Member | Roll No | Contribution |
|---|---|---|
| Anshul Singh | 24293916075 | DB schema, models, admin routes |
| Manasi Sharma | 24293916100 | Auth routes, utilities |
| Aaniya | 24293916097 | Health data entry, delete |
| Gagan | 24293916117 | Health summary, records, tests |
| Shakti Singh | 24293916099 | Session management, PDF reports |

## Stack
- **Frontend**: React (Vite)
- **Backend**: Flask 3 + Flask-SQLAlchemy + Flask-Bcrypt
- **Database**: PostgreSQL

## Run Locally
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL="postgresql://postgres:password@localhost:5432/healthcare_db"
export SECRET_KEY="ayushcare-secret-2026"
python run.py
```
