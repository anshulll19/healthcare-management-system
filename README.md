# Healthcare Management System
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
export SECRET_KEY="healthcare-secret-2026"
python run.py
```

## Project Structure
```text
healthcare-management-system/
├── backend/                  # Flask Backend Application
│   ├── app/                  # Application Core
│   │   ├── routes/           # API Blueprint controllers
│   │   ├── models.py         # SQLAlchemy schema definitions
│   │   ├── config.py         # Environment configurations
│   │   └── __init__.py       # App factory & extension initialization
│   ├── instance/             # Local database storage 
│   ├── requirements.txt      # Python dependencies
│   ├── run.py                # Server entry point
│   └── seed_db.py            # Database seeding utility
└── frontend/                 # React Frontend Application (Vite)
    ├── public/               # Static web assets
    ├── src/                  # React component sources
    │   ├── AdminDashboard.tsx# Superuser administration panel
    │   ├── App.tsx           # Global routing logic
    │   ├── Auth.tsx          # Registration and Login controller
    │   ├── Dashboard.tsx     # Patient summary hub
    │   ├── Layout.tsx        # Navigation wrapping UI
    │   ├── LogHealth.tsx     # Vitals logging view
    │   ├── Logs.tsx          # Administrative system activity log
    │   ├── Patients.tsx      # Patient historical data table
    │   ├── Reports.tsx       # Secure medical document generation
    │   └── main.tsx          # React application mount
    ├── package.json          # Node module assignments
    ├── tailwind.config.js    # Styling framework assignments
    └── vite.config.ts        # Build tool compiler controls
```
