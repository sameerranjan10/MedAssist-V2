"""
app/models/models.py
Complete SQLAlchemy ORM models for MedAssist.
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean,
    DateTime, ForeignKey, JSON, Enum as SAEnum
)
from sqlalchemy.orm import relationship
import enum

from app.core.database import Base


# ── Enums ─────────────────────────────────────────────────────────────────────

class UserRole(str, enum.Enum):
    patient = "patient"
    doctor  = "doctor"
    admin   = "admin"


class ReportStatus(str, enum.Enum):
    uploaded   = "uploaded"
    processing = "processing"
    analyzed   = "analyzed"
    pending_verification = "pending_verification"
    verified   = "verified"
    rejected   = "rejected"


class VerificationDecision(str, enum.Enum):
    approved = "approved"
    rejected = "rejected"
    needs_info = "needs_info"


# ── Models ────────────────────────────────────────────────────────────────────

class User(Base):
    __tablename__ = "users"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String(255), unique=True, index=True, nullable=False)
    full_name  = Column(String(255), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role       = Column(SAEnum(UserRole), default=UserRole.patient, nullable=False)
    is_active  = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    patient_profile = relationship("Patient", back_populates="user", uselist=False)
    doctor_profile  = relationship("Doctor",  back_populates="user", uselist=False)


class Patient(Base):
    __tablename__ = "patients"

    id          = Column(Integer, primary_key=True, index=True)
    user_id     = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    date_of_birth = Column(String(20))
    gender      = Column(String(10))
    blood_group = Column(String(5))
    phone       = Column(String(20))
    address     = Column(Text)
    medical_history = Column(Text)  # stored as JSON string

    # Medical information fields
    height           = Column(String(20))   # e.g. "175 cm"
    weight           = Column(String(20))   # e.g. "70 kg"
    bmi              = Column(String(10))   # e.g. "22.9"
    allergies        = Column(Text)         # free text
    emergency_contact = Column(String(255)) # name + phone
    primary_physician = Column(String(255)) # doctor name

    user    = relationship("User", back_populates="patient_profile")
    reports = relationship("Report", back_populates="patient")
    appointments = relationship("Appointment", back_populates="patient")


class Doctor(Base):
    __tablename__ = "doctors"

    id              = Column(Integer, primary_key=True, index=True)
    user_id         = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    hospital_id     = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    specialization  = Column(String(100))
    license_number  = Column(String(100), unique=True)
    license_verified = Column(Boolean, default=False)
    experience_years = Column(Integer, default=0)
    phone           = Column(String(20))
    signature_path  = Column(String(500))  # path to digital signature image

    user         = relationship("User", back_populates="doctor_profile")
    hospital     = relationship("Hospital", back_populates="doctors")
    verifications = relationship("VerificationLog", back_populates="doctor")
    appointments  = relationship("Appointment", back_populates="doctor")


class Hospital(Base):
    __tablename__ = "hospitals"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String(255), nullable=False)
    address     = Column(Text)
    city        = Column(String(100))
    phone       = Column(String(20))
    email       = Column(String(255))
    is_active   = Column(Boolean, default=True)
    created_at  = Column(DateTime, default=datetime.utcnow)

    doctors = relationship("Doctor", back_populates="hospital")


class Report(Base):
    __tablename__ = "reports"

    id           = Column(Integer, primary_key=True, index=True)
    patient_id   = Column(Integer, ForeignKey("patients.id"), nullable=False)
    file_name    = Column(String(500), nullable=False)
    file_path    = Column(String(1000), nullable=False)
    file_size_kb = Column(Float)
    file_type    = Column(String(20))   # pdf / image
    status       = Column(SAEnum(ReportStatus), default=ReportStatus.uploaded)
    report_type  = Column(String(100))  # e.g. "Complete Blood Count"
    report_date  = Column(String(30))   # date on the report itself
    uploaded_at  = Column(DateTime, default=datetime.utcnow)
    updated_at   = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient      = relationship("Patient", back_populates="reports")
    analysis     = relationship("ReportAnalysis", back_populates="report", uselist=False)
    verifications = relationship("VerificationLog", back_populates="report")
    chat_history  = relationship("ChatHistory", back_populates="report")


class ReportAnalysis(Base):
    __tablename__ = "report_analyses"

    id             = Column(Integer, primary_key=True, index=True)
    report_id      = Column(Integer, ForeignKey("reports.id"), unique=True, nullable=False)
    raw_ocr_text   = Column(Text)
    extracted_params = Column(JSON)   # dict of parameter → {value, unit, normal_range, status}
    ai_summary     = Column(Text)
    ai_explanation = Column(Text)
    ai_recommendation = Column(Text)
    overall_status = Column(String(50))   # normal / mild_abnormal / abnormal / critical
    health_score   = Column(Integer)      # 0–100
    analyzed_at    = Column(DateTime, default=datetime.utcnow)
    model_used     = Column(String(100))

    report = relationship("Report", back_populates="analysis")


class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id          = Column(Integer, primary_key=True, index=True)
    report_id   = Column(Integer, ForeignKey("reports.id"), nullable=False)
    doctor_id   = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    decision    = Column(SAEnum(VerificationDecision), nullable=False)
    remarks     = Column(Text)
    edited_params = Column(JSON)   # doctor's corrections to AI parameters
    verified_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="verifications")
    doctor = relationship("Doctor", back_populates="verifications")


class ChatHistory(Base):
    __tablename__ = "chat_history"

    id         = Column(Integer, primary_key=True, index=True)
    report_id  = Column(Integer, ForeignKey("reports.id"), nullable=False)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)
    role       = Column(String(20))   # "user" | "assistant"
    message    = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    report = relationship("Report", back_populates="chat_history")

class Appointment(Base):
    __tablename__ = "appointments"

    id          = Column(Integer, primary_key=True, index=True)
    patient_id  = Column(Integer, ForeignKey("patients.id"), nullable=False)
    doctor_id   = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    date        = Column(String(20), nullable=False)  # ISO format date
    time        = Column(String(20), nullable=False)
    status      = Column(String(20), default="upcoming")  # upcoming | completed | cancelled
    notes       = Column(Text, nullable=True)
    created_at  = Column(DateTime, default=datetime.utcnow)
    updated_at  = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    patient     = relationship("Patient", back_populates="appointments")
    doctor      = relationship("Doctor", back_populates="appointments")
