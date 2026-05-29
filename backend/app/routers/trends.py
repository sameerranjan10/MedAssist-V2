"""
app/routers/trends.py
Dedicated endpoint for patient health trend data extracted from uploaded reports.
"""
import re
import logging
from typing import Dict, List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import asc

from app.core.database import get_db
from app.core.security import require_role
from app.models.models import Patient, Report, ReportAnalysis
from app.schemas.schemas import HealthTrendsOut, TrendPoint

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/trends", tags=["Trends"])


def _parse_numeric(value_str: str):
    """Extract the first numeric value from a string like '13.2 g/dL' or '< 5.7'."""
    if value_str is None:
        return None
    match = re.search(r"[-+]?\d*\.?\d+", str(value_str))
    if match:
        return float(match.group())
    return None


@router.get("/", response_model=HealthTrendsOut)
def get_health_trends(
    current_user=Depends(require_role("patient")),
    db: Session = Depends(get_db),
):
    """
    Return all health trend data for the authenticated patient.
    Aggregates lab parameters from every analyzed report, ordered chronologically.
    Only parameters with 2+ data points are included (to form a real trend).
    """
    patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
    if not patient:
        raise HTTPException(status_code=404, detail="Patient profile not found.")

    # Fetch all analyzed reports in chronological order
    reports = (
        db.query(Report)
        .filter(
            Report.patient_id == patient.id,
            Report.status.in_(["analyzed", "pending_verification", "verified"]),
        )
        .order_by(asc(Report.uploaded_at))
        .all()
    )

    total_reports = db.query(Report).filter(Report.patient_id == patient.id).count()

    # ── Build health score trend ───────────────────────────────────────────────
    health_score_trend: List[TrendPoint] = []
    for rep in reports:
        if rep.analysis and rep.analysis.health_score is not None:
            health_score_trend.append(
                TrendPoint(
                    date=rep.uploaded_at.strftime("%Y-%m-%d"),
                    value=float(rep.analysis.health_score),
                )
            )

    latest_score = health_score_trend[-1].value if health_score_trend else None
    score_change = None
    if len(health_score_trend) >= 2:
        score_change = int(health_score_trend[-1].value - health_score_trend[0].value)

    # ── Build per-parameter trends ─────────────────────────────────────────────
    param_data: Dict[str, List[TrendPoint]] = {}
    param_units: Dict[str, str] = {}

    for rep in reports:
        if not rep.analysis or not rep.analysis.extracted_params:
            continue

        date_str = rep.uploaded_at.strftime("%Y-%m-%d")
        params = rep.analysis.extracted_params

        for param_name, param_info in params.items():
            if not isinstance(param_info, dict):
                continue

            raw_value = param_info.get("value")
            unit = param_info.get("unit", "")
            numeric = _parse_numeric(raw_value)

            if numeric is None:
                continue

            if param_name not in param_data:
                param_data[param_name] = []
                param_units[param_name] = unit

            param_data[param_name].append(
                TrendPoint(date=date_str, value=numeric)
            )

    # Only include parameters with 2+ data points (a real trend)
    trend_parameters = {k: v for k, v in param_data.items() if len(v) >= 2}
    trend_units = {k: param_units[k] for k in trend_parameters}

    return HealthTrendsOut(
        health_score=health_score_trend,
        parameters=trend_parameters,
        parameter_units=trend_units,
        total_reports=total_reports,
        latest_score=int(latest_score) if latest_score is not None else None,
        score_change=score_change,
    )
