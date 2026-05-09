"""
app/routers/doctor.py
Doctor dashboard endpoints: pending reports, verify, patient history.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role, get_current_user
from app.models.models import (
    Report, ReportStatus, VerificationLog, Doctor, Patient, User
)
from app.schemas.schemas import (
    ReportOut, VerifyReportRequest, VerificationOut, AnalysisOut
)

router = APIRouter(prefix="/api/doctor", tags=["Doctor"])


@router.get("/pending-reports", response_model=List[dict])
def get_pending_reports(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor")),
    skip: int = 0,
    limit: int = 20,
):
    """Return all reports awaiting doctor verification."""
    reports = (
        db.query(Report)
        .filter(Report.status == ReportStatus.pending_verification)
        .order_by(Report.uploaded_at.desc())
        .offset(skip).limit(limit)
        .all()
    )

    result = []
    for r in reports:
        patient = db.query(Patient).filter(Patient.id == r.patient_id).first()
        user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append({
            "id": r.id,
            "file_name": r.file_name,
            "status": r.status,
            "uploaded_at": r.uploaded_at,
            "report_type": r.report_type,
            "patient_name": user.full_name if user else "Unknown",
            "patient_id": r.patient_id,
            "overall_status": r.analysis.overall_status if r.analysis else None,
        })
    return result


@router.get("/reports/{report_id}", response_model=dict)
def get_report_detail(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor")),
):
    """Get full report detail including OCR parameters and AI analysis."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    patient = db.query(Patient).filter(Patient.id == report.patient_id).first()
    user = db.query(User).filter(User.id == patient.user_id).first() if patient else None

    return {
        "report": {
            "id": report.id,
            "file_name": report.file_name,
            "status": report.status,
            "uploaded_at": report.uploaded_at,
        },
        "patient": {
            "name": user.full_name if user else "Unknown",
            "gender": patient.gender if patient else None,
            "date_of_birth": patient.date_of_birth if patient else None,
        },
        "analysis": {
            "extracted_params": report.analysis.extracted_params if report.analysis else {},
            "ai_summary": report.analysis.ai_summary if report.analysis else "",
            "ai_explanation": report.analysis.ai_explanation if report.analysis else "",
            "ai_recommendation": report.analysis.ai_recommendation if report.analysis else "",
            "overall_status": report.analysis.overall_status if report.analysis else "",
            "health_score": report.analysis.health_score if report.analysis else 0,
        } if report.analysis else None,
    }


@router.post("/verify", response_model=VerificationOut, status_code=201)
def verify_report(
    body: VerifyReportRequest,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor")),
):
    """Submit a verification decision (approved / rejected / needs_info)."""
    report = db.query(Report).filter(Report.id == body.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    # Create verification log
    log = VerificationLog(
        report_id=body.report_id,
        doctor_id=doctor.id,
        decision=body.decision,
        remarks=body.remarks,
        edited_params=body.edited_params,
    )
    db.add(log)

    # Update report status
    if body.decision == "approved":
        report.status = ReportStatus.verified
    elif body.decision == "rejected":
        report.status = ReportStatus.rejected
    # needs_info keeps it in pending_verification

    # If doctor edited params, update the analysis
    if body.edited_params and report.analysis:
        report.analysis.extracted_params.update(body.edited_params)

    db.commit()
    db.refresh(log)
    return log


@router.get("/stats", response_model=dict)
def get_doctor_stats(
    db: Session = Depends(get_db),
    current_user=Depends(require_role("doctor")),
):
    """Return summary stats for the doctor dashboard."""
    doctor = db.query(Doctor).filter(Doctor.user_id == current_user.id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor profile not found")

    total_verified = db.query(VerificationLog).filter(
        VerificationLog.doctor_id == doctor.id
    ).count()
    pending = db.query(Report).filter(
        Report.status == ReportStatus.pending_verification
    ).count()

    return {
        "total_verified": total_verified,
        "pending_reports": pending,
        "doctor_name": current_user.full_name,
        "specialization": doctor.specialization,
    }
