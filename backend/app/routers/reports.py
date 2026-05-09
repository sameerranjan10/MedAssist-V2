"""
app/routers/reports.py
Report upload, listing, retrieval, and background processing.
"""
import os
import uuid
import logging
import asyncio
from pathlib import Path
from typing import List

import aiofiles
from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, BackgroundTasks
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import get_current_user, require_role
from app.models.models import Patient, Report, ReportAnalysis, ReportStatus
from app.schemas.schemas import ReportOut, AnalysisOut
from app.services.ocr_service import ocr_service
from app.services.ai_service import ai_service
from app.services.rag_service import rag_service

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reports", tags=["Reports"])

ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg", ".tiff", ".bmp"}
MAX_BYTES = settings.MAX_FILE_SIZE_MB * 1024 * 1024


# ── Upload ────────────────────────────────────────────────────────────────────

@router.post("/upload", response_model=ReportOut, status_code=201)
async def upload_report(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(require_role("patient")),
):
    """
    Accept a PDF or image report.
    Immediately saves the file; runs OCR + AI analysis in the background.
    """
    # Validate extension
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail=f"File type '{ext}' not supported")

    # Read and check size
    content = await file.read()
    if len(content) > MAX_BYTES:
        raise HTTPException(
            status_code=413,
            detail=f"File exceeds {settings.MAX_FILE_SIZE_MB} MB limit"
        )

    # Resolve patient profile
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    # Save file to disk
    upload_dir = Path(settings.UPLOAD_DIR) / str(patient.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    unique_name = f"{uuid.uuid4()}{ext}"
    file_path = upload_dir / unique_name

    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)

    # Create DB record
    report = Report(
        patient_id=patient.id,
        file_name=file.filename,
        file_path=str(file_path),
        file_size_kb=round(len(content) / 1024, 2),
        file_type=ext.lstrip("."),
        status=ReportStatus.processing,
    )
    db.add(report)
    db.commit()
    db.refresh(report)

    # Schedule background analysis
    background_tasks.add_task(_analyze_in_background, report.id, str(file_path))

    return report


# ── List patient's reports ─────────────────────────────────────────────────────

@router.get("/", response_model=List[ReportOut])
def list_reports(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
    skip: int = 0,
    limit: int = 20,
):
    """Return all reports for the authenticated patient."""
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found")

    reports = (
        db.query(Report)
        .filter(Report.patient_id == patient.id)
        .order_by(Report.uploaded_at.desc())
        .offset(skip).limit(limit)
        .all()
    )
    return reports


# ── Single report ─────────────────────────────────────────────────────────────

@router.get("/{report_id}", response_model=ReportOut)
def get_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    report = _get_owned_report(report_id, current_user, db)
    return report


# ── Analysis result ───────────────────────────────────────────────────────────

@router.get("/{report_id}/analysis", response_model=AnalysisOut)
def get_analysis(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    report = _get_owned_report(report_id, current_user, db)
    if not report.analysis:
        raise HTTPException(status_code=404, detail="Analysis not ready yet")
    return report.analysis


# ── Delete ─────────────────────────────────────────────────────────────────────

@router.delete("/{report_id}", status_code=204)
def delete_report(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(require_role("patient")),
):
    report = _get_owned_report(report_id, current_user, db)
    # Remove file from disk
    try:
        os.remove(report.file_path)
    except FileNotFoundError:
        pass
    db.delete(report)
    db.commit()


# ── Background task ───────────────────────────────────────────────────────────

def _analyze_in_background(report_id: int, file_path: str):
    """
    Runs OCR → AI analysis → RAG indexing.
    Executed in a background thread by FastAPI's BackgroundTasks.
    """
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            return

        # 1) OCR
        raw_text, params = ocr_service.process_file(file_path)

        # 2) AI Analysis
        analysis_data = ai_service.analyze_report(raw_text, params)

        # 3) Store analysis
        analysis = ReportAnalysis(
            report_id=report_id,
            raw_ocr_text=raw_text,
            extracted_params=params,
            **analysis_data,
        )
        db.add(analysis)
        report.status = ReportStatus.pending_verification
        db.commit()

        # 4) Index for RAG chatbot
        rag_service.index_report(report_id, raw_text)

        logger.info(f"Report {report_id} analysis complete.")
    except Exception as e:
        logger.error(f"Background analysis failed for report {report_id}: {e}")
        if report:
            report.status = ReportStatus.uploaded  # allow retry
            db.commit()
    finally:
        db.close()


# ── Helpers ───────────────────────────────────────────────────────────────────

def _get_owned_report(report_id: int, current_user, db: Session) -> Report:
    """Fetch a report and verify ownership (or allow doctor/admin access)."""
    report = db.query(Report).filter(Report.id == report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if current_user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or report.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")

    return report
