"""
scripts/seed_demo.py
────────────────────────────────────────────────────────────────────────────
Seed the MedAssist database with demo users, doctors, hospitals and a sample
report + analysis so you can log in and explore the platform immediately.

Usage:
    cd backend
    python -m scripts.seed_demo
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.core.database import SessionLocal, Base, engine
from app.core.security import hash_password
from app.models.models import (
    User, UserRole, Patient, Doctor,
    Hospital, Report, ReportAnalysis, ReportStatus,
)
from datetime import datetime


def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Skip if already seeded
        if db.query(User).filter(User.email == "patient@demo.com").first():
            print("ℹ️  Demo data already present — skipping seed.")
            return

        print("🌱 Seeding demo data…")

        # ── Hospital ──────────────────────────────────────────────────────────
        hospital = Hospital(
            name="Apollo Hospitals",
            city="Mumbai",
            address="Sahar Road, Andheri (E), Mumbai 400059",
            phone="+91 22 6703 6703",
            email="info@apollohospitals.com",
        )
        db.add(hospital)
        db.flush()

        # ── Users ─────────────────────────────────────────────────────────────
        patient_user = User(
            email="patient@demo.com",
            full_name="Rohan Sharma",
            hashed_password=hash_password("demo1234"),
            role=UserRole.patient,
        )
        doctor_user = User(
            email="doctor@demo.com",
            full_name="Dr. Ananya Verma",
            hashed_password=hash_password("demo1234"),
            role=UserRole.doctor,
        )
        admin_user = User(
            email="admin@demo.com",
            full_name="Dr. Vivek Rao",
            hashed_password=hash_password("demo1234"),
            role=UserRole.admin,
        )
        db.add_all([patient_user, doctor_user, admin_user])
        db.flush()

        # ── Profiles ──────────────────────────────────────────────────────────
        patient_profile = Patient(
            user_id=patient_user.id,
            date_of_birth="1993-04-15",
            gender="Male",
            blood_group="B+",
            phone="+91 98765 43210",
            address="Flat 402, Shanti Nagar, Andheri West, Mumbai 400058",
        )
        doctor_profile = Doctor(
            user_id=doctor_user.id,
            hospital_id=hospital.id,
            specialization="Hematologist",
            license_number="MCI-2019-HEM-4521",
            license_verified=True,
            experience_years=8,
            phone="+91 99887 76655",
        )
        db.add_all([patient_profile, doctor_profile])
        db.flush()

        # ── Sample Report + Analysis ──────────────────────────────────────────
        report = Report(
            patient_id=patient_profile.id,
            file_name="Complete_Blood_Count.pdf",
            file_path="./uploads/demo/Complete_Blood_Count.pdf",
            file_size_kb=2457.6,
            file_type="pdf",
            status=ReportStatus.verified,
            report_type="Complete Blood Count",
            report_date="10 May, 2025",
            uploaded_at=datetime(2025, 5, 10, 14, 30),
        )
        db.add(report)
        db.flush()

        analysis = ReportAnalysis(
            report_id=report.id,
            raw_ocr_text="COMPLETE BLOOD COUNT\nHemoglobin: 11.2 g/dL\nRBC Count: 3.9 million/uL\nWBC Count: 7200 /uL\nPlatelet Count: 245000 /uL\nMCV: 87 fL",
            extracted_params={
                "hemoglobin": {
                    "label": "Hemoglobin (Hb)",
                    "value": "11.2",
                    "unit": "g/dL",
                    "normal_range": "13.0–17.0 g/dL",
                    "status": "low",
                },
                "rbc": {
                    "label": "RBC Count",
                    "value": "3.9",
                    "unit": "million/µL",
                    "normal_range": "4.5–5.9 million/µL",
                    "status": "low",
                },
                "wbc": {
                    "label": "WBC Count",
                    "value": "7200",
                    "unit": "/µL",
                    "normal_range": "4000–11000 /µL",
                    "status": "normal",
                },
                "platelets": {
                    "label": "Platelet Count",
                    "value": "245000",
                    "unit": "/µL",
                    "normal_range": "150000–400000 /µL",
                    "status": "normal",
                },
                "mcv": {
                    "label": "MCV",
                    "value": "87",
                    "unit": "fL",
                    "normal_range": "80–100 fL",
                    "status": "normal",
                },
            },
            ai_summary=(
                "Your report indicates mild anemia with low hemoglobin (11.2 g/dL) "
                "and low RBC count (3.9 million/µL). WBC count, platelet count, and "
                "MCV are within the normal range."
            ),
            ai_explanation=(
                "Hemoglobin carries oxygen in your red blood cells. A level of 11.2 g/dL "
                "is below the normal range of 13–17 g/dL for men, which is called mild anemia. "
                "Your low RBC count (3.9 vs normal 4.5–5.9) is consistent with this. "
                "This type of anemia is often caused by iron deficiency, poor diet, or chronic "
                "blood loss. The good news is your WBC (immune) and platelet (clotting) counts "
                "are perfectly normal."
            ),
            ai_recommendation=(
                "1. Increase dietary iron — eat spinach, lentils, red meat, beans, and fortified cereals.\n"
                "2. Take Vitamin C with iron-rich foods to improve absorption.\n"
                "3. Avoid tea and coffee immediately after meals as they reduce iron absorption.\n"
                "4. Consult your doctor about iron supplements and to rule out other causes.\n"
                "5. Schedule a follow-up blood test in 6–8 weeks to track improvement."
            ),
            overall_status="mild_abnormal",
            health_score=78,
            model_used="llama-3.3-70b-versatile",
        )
        db.add(analysis)
        db.commit()

        print("✅ Demo data seeded successfully!")
        print()
        print("  Demo accounts:")
        print("  ┌──────────────────────────────────────────────────────────┐")
        print("  │  Patient  → patient@demo.com  / demo1234                 │")
        print("  │  Doctor   → doctor@demo.com   / demo1234                 │")
        print("  │  Admin    → admin@demo.com    / demo1234                 │")
        print("  └──────────────────────────────────────────────────────────┘")

    except Exception as e:
        db.rollback()
        print(f"❌ Seed failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()
