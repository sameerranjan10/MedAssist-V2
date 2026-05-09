"""
app/routers/admin.py
Hospital admin endpoints: stats, manage doctors/patients, hospitals.
"""
from datetime import datetime, date
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import require_role
from app.models.models import (
    User, UserRole, Doctor, Patient, Report,
    ReportStatus, Hospital, VerificationLog
)
from app.schemas.schemas import AdminStats, HospitalCreate, HospitalOut, UserOut

router = APIRouter(prefix="/api/admin", tags=["Admin"])


@router.get("/stats", response_model=AdminStats)
def get_admin_stats(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    """Return platform-wide analytics for the admin dashboard."""
    today = date.today()

    return AdminStats(
        total_patients=db.query(Patient).count(),
        total_doctors=db.query(Doctor).count(),
        total_reports=db.query(Report).count(),
        verified_reports=db.query(Report).filter(
            Report.status == ReportStatus.verified
        ).count(),
        pending_reports=db.query(Report).filter(
            Report.status == ReportStatus.pending_verification
        ).count(),
        rejected_reports=db.query(Report).filter(
            Report.status == ReportStatus.rejected
        ).count(),
        reports_today=db.query(Report).filter(
            Report.uploaded_at >= datetime.combine(today, datetime.min.time())
        ).count(),
    )


@router.get("/users", response_model=List[UserOut])
def list_users(
    role: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    """List all users, optionally filtered by role."""
    q = db.query(User)
    if role:
        q = q.filter(User.role == role)
    return q.order_by(User.created_at.desc()).offset(skip).limit(limit).all()


@router.patch("/users/{user_id}/toggle-active")
def toggle_user_active(
    user_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    """Enable or disable a user account."""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"user_id": user_id, "is_active": user.is_active}


@router.patch("/doctors/{doctor_id}/verify-license")
def verify_doctor_license(
    doctor_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    """Mark a doctor's license as verified."""
    doctor = db.query(Doctor).filter(Doctor.id == doctor_id).first()
    if not doctor:
        raise HTTPException(status_code=404, detail="Doctor not found")
    doctor.license_verified = True
    db.commit()
    return {"doctor_id": doctor_id, "license_verified": True}


# ── Hospitals ─────────────────────────────────────────────────────────────────

@router.get("/hospitals", response_model=List[HospitalOut])
def list_hospitals(
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    return db.query(Hospital).order_by(Hospital.name).all()


@router.post("/hospitals", response_model=HospitalOut, status_code=201)
def create_hospital(
    body: HospitalCreate,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    hospital = Hospital(**body.model_dump())
    db.add(hospital)
    db.commit()
    db.refresh(hospital)
    return hospital


@router.delete("/hospitals/{hospital_id}", status_code=204)
def delete_hospital(
    hospital_id: int,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    hospital = db.query(Hospital).filter(Hospital.id == hospital_id).first()
    if not hospital:
        raise HTTPException(status_code=404, detail="Hospital not found")
    db.delete(hospital)
    db.commit()


# ── Report management ─────────────────────────────────────────────────────────

@router.get("/reports", response_model=List[dict])
def list_all_reports(
    status: str = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    _=Depends(require_role("admin")),
):
    """List all reports across all patients."""
    q = db.query(Report)
    if status:
        q = q.filter(Report.status == status)
    reports = q.order_by(Report.uploaded_at.desc()).offset(skip).limit(limit).all()

    result = []
    for r in reports:
        patient = db.query(Patient).filter(Patient.id == r.patient_id).first()
        user = db.query(User).filter(User.id == patient.user_id).first() if patient else None
        result.append({
            "id": r.id,
            "file_name": r.file_name,
            "status": r.status,
            "uploaded_at": r.uploaded_at,
            "patient_name": user.full_name if user else "Unknown",
            "overall_status": r.analysis.overall_status if r.analysis else None,
        })
    return result
