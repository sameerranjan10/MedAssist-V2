"""
app/utils/helpers.py
Reusable utility functions across the MedAssist backend.
"""
import os
import uuid
import re
from datetime import datetime
from pathlib import Path
from typing import Optional


# ── File utilities ────────────────────────────────────────────────────────────

def generate_unique_filename(original_name: str) -> str:
    """
    Prefix the original filename with a UUID to prevent collisions.
    e.g. 'blood_test.pdf' → 'a3f2c1d0_blood_test.pdf'
    """
    stem = Path(original_name).stem
    suffix = Path(original_name).suffix.lower()
    safe_stem = re.sub(r'[^a-zA-Z0-9_-]', '_', stem)[:40]
    return f"{uuid.uuid4().hex[:8]}_{safe_stem}{suffix}"


def human_readable_size(size_bytes: float) -> str:
    """Convert bytes to human-readable string."""
    if size_bytes < 1024:
        return f"{size_bytes:.0f} B"
    elif size_bytes < 1024 ** 2:
        return f"{size_bytes / 1024:.1f} KB"
    else:
        return f"{size_bytes / (1024 ** 2):.1f} MB"


def ensure_dir(path: str) -> Path:
    """Create directory (and parents) if it doesn't exist."""
    p = Path(path)
    p.mkdir(parents=True, exist_ok=True)
    return p


# ── Date / time utilities ─────────────────────────────────────────────────────

def format_date_india(dt: datetime) -> str:
    """Format datetime as '10 May, 2025' (Indian style)."""
    return dt.strftime("%-d %b, %Y")


def format_datetime_india(dt: datetime) -> str:
    """Format datetime as '10 May, 2025 • 2:30 PM'."""
    return dt.strftime("%-d %b, %Y • %-I:%M %p")


# ── Medical value helpers ─────────────────────────────────────────────────────

def get_status_label(status: str) -> str:
    """Return human-friendly label for a parameter status."""
    mapping = {
        "normal":        "Normal",
        "low":           "Low",
        "high":          "High",
        "critical":      "Critical",
        "unknown":       "—",
    }
    return mapping.get(status, status.title())


def get_overall_status_label(overall: str) -> str:
    labels = {
        "normal":        "All Normal",
        "mild_abnormal": "Mild Abnormalities",
        "abnormal":      "Abnormal",
        "critical":      "Critical — Seek Immediate Care",
    }
    return labels.get(overall, overall.replace("_", " ").title())


def compute_health_score_label(score: int) -> str:
    """Return a text label for health score ranges."""
    if score >= 85:  return "Excellent"
    if score >= 70:  return "Good"
    if score >= 55:  return "Fair"
    if score >= 40:  return "Below Average"
    return "Poor"


# ── String sanitisation ───────────────────────────────────────────────────────

def sanitize_for_prompt(text: str, max_chars: int = 3000) -> str:
    """
    Truncate and clean OCR text before including in an LLM prompt.
    Removes control characters and limits length.
    """
    # Remove non-printable characters except newlines and tabs
    clean = re.sub(r'[^\x20-\x7E\n\t]', ' ', text)
    # Collapse multiple spaces
    clean = re.sub(r' {3,}', '  ', clean)
    # Truncate
    return clean[:max_chars].strip()


def extract_report_type(ocr_text: str) -> Optional[str]:
    """
    Attempt to identify the report type from the OCR text header.
    Returns e.g. 'Complete Blood Count', 'Lipid Profile', 'Thyroid Function Test'.
    """
    text_lower = ocr_text.lower()
    type_patterns = [
        (r'complete blood count|cbc',        "Complete Blood Count"),
        (r'lipid profile|cholesterol panel',  "Lipid Profile"),
        (r'thyroid[^a-z]*function|tsh|t3|t4', "Thyroid Function Test"),
        (r'liver function|lft|sgpt|sgot',     "Liver Function Test"),
        (r'kidney function|renal|creatinine', "Kidney Function Test"),
        (r'diabetes|hba1c|glucose',           "Diabetes Panel"),
        (r'vitamin d',                         "Vitamin D Test"),
        (r'vitamin b12',                       "Vitamin B12 Test"),
        (r'urine[^a-z]*analysis|urinalysis',   "Urinalysis"),
        (r'culture[^a-z]*sensitivity',         "Culture & Sensitivity"),
        (r'covid|sars',                        "COVID-19 Test"),
    ]
    for pattern, label in type_patterns:
        if re.search(pattern, text_lower):
            return label
    return None


# ── Pagination helper ─────────────────────────────────────────────────────────

def paginate(query, skip: int = 0, limit: int = 20):
    """Apply offset/limit pagination to a SQLAlchemy query."""
    return query.offset(skip).limit(limit)
