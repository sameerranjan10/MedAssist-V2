"""
app/routers/dashboard.py
Endpoints for dynamic patient dashboard data.
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Patient, Report, ReportAnalysis, Appointment, Doctor, Hospital
from app.schemas.schemas import DashboardStatsOut, TrendData

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("/stats", response_model=DashboardStatsOut)
def get_dashboard_stats(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    if current_user.role != "patient":
        raise HTTPException(status_code=403, detail="Dashboard stats only available for patients.")
    
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    # 1. Reports Uploaded
    reports_uploaded = db.query(Report).filter(Report.patient_id == patient.id).count()

    # 2. AI Analyses count
    ai_analyses = db.query(ReportAnalysis).join(Report).filter(Report.patient_id == patient.id).count()

    # 3. Recent Reports (top 5)
    recent_reports = db.query(Report).filter(Report.patient_id == patient.id).order_by(desc(Report.uploaded_at)).limit(5).all()

    # 4. Latest Analysis for health score and tip
    latest_report = db.query(Report).filter(
        Report.patient_id == patient.id,
        Report.status.in_(["analyzed", "verified", "pending_verification"])
    ).order_by(desc(Report.uploaded_at)).first()

    health_score = 0
    ai_tip = "Upload your first report to get personalized AI health tips."
    
    if latest_report and latest_report.analysis:
        health_score = latest_report.analysis.health_score or 0
        if latest_report.analysis.ai_recommendation:
            # We can extract a shorter snippet or use the full recommendation
            ai_tip = latest_report.analysis.ai_recommendation

    # 5. Upcoming Appointments
    upcoming_appointments = db.query(Appointment).filter(
        Appointment.patient_id == patient.id,
        Appointment.status == "upcoming"
    ).order_by(Appointment.date, Appointment.time).all()

    appt_out = []
    for appt in upcoming_appointments:
        doctor = db.query(Doctor).filter(Doctor.id == appt.doctor_id).first()
        doc_user = db.query(User).filter(User.id == doctor.user_id).first() if doctor else None
        hospital = db.query(Hospital).filter(Hospital.id == doctor.hospital_id).first() if doctor and doctor.hospital_id else None
        
        appt_out.append({
            "id": appt.id,
            "doctor_name": doc_user.full_name if doc_user else "Unknown Doctor",
            "specialization": doctor.specialization if doctor else "",
            "hospital": hospital.name if hospital else "",
            "date": appt.date,
            "time": appt.time,
            "status": appt.status
        })

    # 6. Health Trends
    # Get all analyzed reports for this patient, ascending order
    all_reports_with_analysis = db.query(Report).filter(
        Report.patient_id == patient.id,
        Report.status.in_(["analyzed", "verified", "pending_verification"])
    ).order_by(Report.uploaded_at).all()

    trends_dict = {}
    for rep in all_reports_with_analysis:
        if not rep.analysis or not rep.analysis.extracted_params:
            continue
        
        # Format the date nicely for the x-axis, e.g., "12 May"
        date_str = rep.uploaded_at.strftime("%d %b")
        params = rep.analysis.extracted_params
        
        for param_name, param_info in params.items():
            if isinstance(param_info, dict) and "value" in param_info and "unit" in param_info:
                try:
                    # Clean up value and convert to float (e.g. "11.2" -> 11.2)
                    import re
                    val_str = str(param_info["value"])
                    # Extract numeric part
                    match = re.search(r"[-+]?\d*\.\d+|\d+", val_str)
                    if match:
                        val = float(match.group())
                        if param_name not in trends_dict:
                            trends_dict[param_name] = {"unit": param_info["unit"], "data": []}
                        
                        trends_dict[param_name]["data"].append({
                            "month": date_str,  # Reusing 'month' key for frontend compatibility
                            "value": val
                        })
                except Exception:
                    pass

    # Convert to List[TrendData]
    health_trends = []
    for p_name, data_obj in trends_dict.items():
        if len(data_obj["data"]) > 1: # Only include if there's an actual trend (more than 1 data point)
            health_trends.append({
                "parameter_name": p_name,
                "unit": data_obj["unit"],
                "data": data_obj["data"]
            })

    return DashboardStatsOut(
        reports_uploaded=reports_uploaded,
        ai_analyses=ai_analyses,
        health_score=health_score,
        recent_reports=recent_reports,
        upcoming_appointments=appt_out,
        health_trends=health_trends,
        ai_tip=ai_tip
    )
