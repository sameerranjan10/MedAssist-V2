"""
app/schemas/schemas.py
Pydantic v2 request/response models for every API endpoint.
"""
from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, EmailStr, field_validator


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    role: str = "patient"  # patient | doctor | admin

    @field_validator("role")
    @classmethod
    def validate_role(cls, v):
        if v not in ("patient", "doctor", "admin"):
            raise ValueError("Role must be patient, doctor, or admin")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    full_name: str
    user_id: int
    email: Optional[str] = None


class UserOut(BaseModel):
    id: int
    email: str
    full_name: str
    role: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


# ── Patient ───────────────────────────────────────────────────────────────────

class PatientProfileUpdate(BaseModel):
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None


class PatientOut(BaseModel):
    id: int
    user_id: int
    date_of_birth: Optional[str]
    gender: Optional[str]
    blood_group: Optional[str]
    phone: Optional[str]

    class Config:
        from_attributes = True


# ── Reports ───────────────────────────────────────────────────────────────────

class ReportOut(BaseModel):
    id: int
    file_name: str
    file_type: str
    file_size_kb: Optional[float]
    status: str
    report_type: Optional[str]
    report_date: Optional[str]
    uploaded_at: datetime

    class Config:
        from_attributes = True


class ReportListOut(BaseModel):
    reports: List[ReportOut]
    total: int


# ── Analysis ──────────────────────────────────────────────────────────────────

class ParameterInfo(BaseModel):
    value: str
    unit: str
    normal_range: str
    status: str  # normal | low | high | critical


class AnalysisOut(BaseModel):
    id: int
    report_id: int
    extracted_params: Dict[str, ParameterInfo]
    ai_summary: str
    ai_explanation: str
    ai_recommendation: str
    overall_status: str
    health_score: int
    analyzed_at: datetime
    model_used: str

    class Config:
        from_attributes = True


# ── Chatbot ───────────────────────────────────────────────────────────────────

class ChatMessageRequest(BaseModel):
    report_id: int
    message: str


class ChatMessageOut(BaseModel):
    role: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True


class ChatResponse(BaseModel):
    answer: str
    report_id: int


# ── Doctor ────────────────────────────────────────────────────────────────────

class DoctorProfileUpdate(BaseModel):
    specialization: Optional[str] = None
    license_number: Optional[str] = None
    experience_years: Optional[int] = None
    phone: Optional[str] = None


class VerifyReportRequest(BaseModel):
    report_id: int
    decision: str        # approved | rejected | needs_info
    remarks: Optional[str] = None
    edited_params: Optional[Dict[str, Any]] = None

    @field_validator("decision")
    @classmethod
    def validate_decision(cls, v):
        if v not in ("approved", "rejected", "needs_info"):
            raise ValueError("Decision must be approved, rejected, or needs_info")
        return v


class VerificationOut(BaseModel):
    id: int
    report_id: int
    decision: str
    remarks: Optional[str]
    verified_at: datetime

    class Config:
        from_attributes = True


# ── Admin ─────────────────────────────────────────────────────────────────────

class HospitalCreate(BaseModel):
    name: str
    address: Optional[str] = None
    city: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None


class HospitalOut(BaseModel):
    id: int
    name: str
    city: Optional[str]
    is_active: bool

    class Config:
        from_attributes = True


class AdminStats(BaseModel):
    total_patients: int
    total_doctors: int
    total_reports: int
    verified_reports: int
    pending_reports: int
    rejected_reports: int
    reports_today: int


# ── Dashboard ─────────────────────────────────────────────────────────────────

class AppointmentOut(BaseModel):
    id: int
    doctor_name: str
    specialization: Optional[str]
    hospital: Optional[str]
    date: str
    time: str
    status: str
    
    class Config:
        from_attributes = True

class TrendData(BaseModel):
    parameter_name: str
    data: List[Dict[str, Any]] # e.g. [{"month": "Jan", "value": 11.2}, {"month": "Feb", "value": 11.5}]
    unit: str

class DashboardStatsOut(BaseModel):
    reports_uploaded: int
    ai_analyses: int
    health_score: int
    recent_reports: List[ReportOut]
    upcoming_appointments: List[AppointmentOut]
    health_trends: List[TrendData]
    ai_tip: str
