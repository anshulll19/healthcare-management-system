from io import BytesIO
from datetime import datetime
from flask import Blueprint, send_file, jsonify
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from ..models import HealthRecord
from ..utils.auth_utils import login_required, get_current_user

reports_bp = Blueprint("reports", __name__)

@reports_bp.route("/download", methods=["GET"])
@login_required
def download_report():
    user    = get_current_user()
    records = HealthRecord.query.filter_by(user_id=user.id).order_by(HealthRecord.created_at.asc()).all()
    buffer  = BytesIO()
    doc     = SimpleDocTemplate(buffer, pagesize=A4, leftMargin=2*cm, rightMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm)
    styles  = getSampleStyleSheet()
    title_style = ParagraphStyle("title", parent=styles["Heading1"], fontSize=18, spaceAfter=6)
    sub_style   = ParagraphStyle("sub", parent=styles["Normal"], fontSize=10, textColor=colors.grey)
    story = []
    story.append(Paragraph("AyushCare — AI Smart Healthcare Assistance for Bharat", title_style))
    story.append(Paragraph(f"Health Report — {user.name}", styles["Heading2"]))
    story.append(Paragraph(f"Generated: {datetime.utcnow().strftime('%d %B %Y, %H:%M UTC')}", sub_style))
    story.append(Spacer(1, 0.5*cm))
    if not records:
        story.append(Paragraph("No health records found.", styles["Normal"]))
    else:
        header = ["Date", "Weight (kg)", "Height (cm)", "Blood Pressure", "Blood Sugar (mg/dL)"]
        rows   = [header]
        for r in records:
            rows.append([
                r.created_at.strftime("%d/%m/%Y"),
                str(r.weight)      or "—",
                str(r.height)      or "—",
                r.blood_pressure   or "—",
                str(r.blood_sugar) or "—",
            ])
        table = Table(rows, repeatRows=1)
        table.setStyle(TableStyle([
            ("BACKGROUND",     (0, 0), (-1,  0), colors.HexColor("#1a6b4a")),
            ("TEXTCOLOR",      (0, 0), (-1,  0), colors.white),
            ("FONTNAME",       (0, 0), (-1,  0), "Helvetica-Bold"),
            ("FONTSIZE",       (0, 0), (-1, -1), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F7FA")]),
            ("GRID",           (0, 0), (-1, -1), 0.3, colors.HexColor("#CCCCCC")),
            ("ALIGN",          (1, 0), (-1, -1), "CENTER"),
            ("TOPPADDING",     (0, 0), (-1, -1), 5),
            ("BOTTOMPADDING",  (0, 0), (-1, -1), 5),
        ]))
        story.append(table)
    doc.build(story)
    buffer.seek(0)
    filename = f"ayushcare_report_{user.name.replace(' ', '_')}_{datetime.utcnow().strftime('%Y%m%d')}.pdf"
    return send_file(buffer, as_attachment=True, download_name=filename, mimetype="application/pdf")
