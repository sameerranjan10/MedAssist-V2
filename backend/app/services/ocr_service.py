"""
app/services/ocr_service.py
Complete OCR pipeline:
  PDF / image  →  raw text  →  structured medical parameters (JSON)

Libraries: pdfplumber, pdf2image, pytesseract, OpenCV, Pillow
"""
import re
import io
import logging
from pathlib import Path
from typing import Dict, Tuple

import cv2
import numpy as np
import pytesseract
import pdfplumber
from pdf2image import convert_from_path
from PIL import Image

logger = logging.getLogger(__name__)


# ── Normal reference ranges ───────────────────────────────────────────────────
NORMAL_RANGES: Dict[str, dict] = {
    "hemoglobin": {
        "male":   (13.0, 17.0), "female": (12.0, 15.5),
        "unit": "g/dL", "label": "Hemoglobin (Hb)"
    },
    "rbc": {
        "male":   (4.5, 5.9), "female": (4.0, 5.2),
        "unit": "million/µL", "label": "RBC Count"
    },
    "wbc": {
        "both": (4000, 11000),
        "unit": "/µL", "label": "WBC Count"
    },
    "platelets": {
        "both": (150000, 400000),
        "unit": "/µL", "label": "Platelet Count"
    },
    "glucose_fasting": {
        "both": (70, 100),
        "unit": "mg/dL", "label": "Glucose (Fasting)"
    },
    "glucose_pp": {
        "both": (70, 140),
        "unit": "mg/dL", "label": "Glucose (Post Prandial)"
    },
    "hba1c": {
        "both": (4.0, 5.7),
        "unit": "%", "label": "HbA1c"
    },
    "cholesterol_total": {
        "both": (0, 200),
        "unit": "mg/dL", "label": "Total Cholesterol"
    },
    "ldl": {
        "both": (0, 100),
        "unit": "mg/dL", "label": "LDL Cholesterol"
    },
    "hdl": {
        "male": (40, 200), "female": (50, 200),
        "unit": "mg/dL", "label": "HDL Cholesterol"
    },
    "triglycerides": {
        "both": (0, 150),
        "unit": "mg/dL", "label": "Triglycerides"
    },
    "creatinine": {
        "male": (0.7, 1.3), "female": (0.5, 1.1),
        "unit": "mg/dL", "label": "Creatinine"
    },
    "urea": {
        "both": (7, 20),
        "unit": "mg/dL", "label": "Blood Urea Nitrogen"
    },
    "uric_acid": {
        "male": (3.4, 7.0), "female": (2.4, 6.0),
        "unit": "mg/dL", "label": "Uric Acid"
    },
    "tsh": {
        "both": (0.4, 4.0),
        "unit": "µIU/mL", "label": "TSH"
    },
    "vitamin_d": {
        "both": (20, 50),
        "unit": "ng/mL", "label": "Vitamin D"
    },
    "vitamin_b12": {
        "both": (200, 900),
        "unit": "pg/mL", "label": "Vitamin B12"
    },
    "mcv": {
        "both": (80, 100),
        "unit": "fL", "label": "MCV"
    },
    "mchc": {
        "both": (31.5, 35.7),
        "unit": "g/dL", "label": "MCHC"
    },
}

# Regex patterns to extract parameter values from OCR text
PARAM_PATTERNS: Dict[str, list] = {
    "hemoglobin": [
        r"h[ae]moglobin[^0-9]*(\d+\.?\d*)",
        r"\bHb\b[^0-9]*(\d+\.?\d*)",
        r"\bHGB\b[^0-9]*(\d+\.?\d*)",
    ],
    "rbc": [
        r"RBC[^0-9]*(\d+\.?\d*)",
        r"red\s*blood\s*cell[^0-9]*(\d+\.?\d*)",
        r"erythrocyte[^0-9]*(\d+\.?\d*)",
    ],
    "wbc": [
        r"WBC[^0-9]*(\d[\d,]*)",
        r"white\s*blood\s*cell[^0-9]*(\d[\d,]*)",
        r"leukocyte[^0-9]*(\d[\d,]*)",
    ],
    "platelets": [
        r"platelet[^0-9]*(\d[\d,]*)",
        r"\bPLT\b[^0-9]*(\d[\d,]*)",
    ],
    "glucose_fasting": [
        r"glucose[\s\w]*fasting[^0-9]*(\d+\.?\d*)",
        r"fasting[\s\w]*glucose[^0-9]*(\d+\.?\d*)",
        r"\bFBS\b[^0-9]*(\d+\.?\d*)",
    ],
    "hba1c": [
        r"HbA1c[^0-9]*(\d+\.?\d*)",
        r"glyco[sz]ylated[^0-9]*(\d+\.?\d*)",
        r"A1C[^0-9]*(\d+\.?\d*)",
    ],
    "cholesterol_total": [
        r"total\s*cholesterol[^0-9]*(\d+\.?\d*)",
        r"cholesterol[,\s]*total[^0-9]*(\d+\.?\d*)",
    ],
    "ldl": [
        r"LDL[^0-9]*(\d+\.?\d*)",
        r"low\s*density[^0-9]*(\d+\.?\d*)",
    ],
    "hdl": [
        r"HDL[^0-9]*(\d+\.?\d*)",
        r"high\s*density[^0-9]*(\d+\.?\d*)",
    ],
    "triglycerides": [
        r"triglyceride[^0-9]*(\d+\.?\d*)",
        r"\bTG\b[^0-9]*(\d+\.?\d*)",
    ],
    "creatinine": [
        r"creatinine[^0-9]*(\d+\.?\d*)",
        r"\bCr\b[^0-9]*(\d+\.?\d*)",
    ],
    "tsh": [
        r"\bTSH\b[^0-9]*(\d+\.?\d*)",
        r"thyroid\s*stimulating[^0-9]*(\d+\.?\d*)",
    ],
    "vitamin_d": [
        r"vitamin\s*d[^0-9]*(\d+\.?\d*)",
        r"25-?OH[^0-9]*(\d+\.?\d*)",
    ],
    "vitamin_b12": [
        r"vitamin\s*b[\s-]?12[^0-9]*(\d+\.?\d*)",
        r"cobalamin[^0-9]*(\d+\.?\d*)",
    ],
    "urea": [
        r"\bBUN\b[^0-9]*(\d+\.?\d*)",
        r"blood\s*urea[^0-9]*(\d+\.?\d*)",
    ],
    "mcv": [
        r"\bMCV\b[^0-9]*(\d+\.?\d*)",
    ],
}


class OCRService:
    """Handles text extraction from PDF/image files and parameter parsing."""

    # ── Public API ─────────────────────────────────────────────────────────────

    def process_file(self, file_path: str, gender: str = "both") -> Tuple[str, dict]:
        """
        Main entry point.
        Returns (raw_ocr_text, structured_parameters_dict).
        """
        path = Path(file_path)
        suffix = path.suffix.lower()

        if suffix == ".pdf":
            raw_text = self._extract_from_pdf(file_path)
        elif suffix in (".png", ".jpg", ".jpeg", ".tiff", ".bmp", ".webp"):
            raw_text = self._extract_from_image(file_path)
        else:
            raise ValueError(f"Unsupported file type: {suffix}")

        params = self._parse_parameters(raw_text, gender=gender)
        return raw_text, params

    # ── Text Extraction ────────────────────────────────────────────────────────

    def _extract_from_pdf(self, file_path: str) -> str:
        """
        Try pdfplumber first (digital PDFs).
        Fall back to OCR via pdf2image + Tesseract for scanned PDFs.
        """
        text = ""

        # 1) Try native text extraction
        try:
            with pdfplumber.open(file_path) as pdf:
                for page in pdf.pages:
                    extracted = page.extract_text()
                    if extracted:
                        text += extracted + "\n"
        except Exception as e:
            logger.warning(f"pdfplumber failed: {e}")

        # 2) If little/no text, run OCR on rendered page images
        if len(text.strip()) < 100:
            logger.info("PDF appears to be scanned — running OCR")
            try:
                images = convert_from_path(file_path, dpi=300)
                for img in images:
                    preprocessed = self._preprocess_image(np.array(img))
                    text += pytesseract.image_to_string(preprocessed, lang="eng") + "\n"
            except Exception as e:
                logger.error(f"pdf2image OCR failed: {e}")

        return text.strip()

    def _extract_from_image(self, file_path: str) -> str:
        """Load image, preprocess, and run Tesseract OCR."""
        img = cv2.imread(file_path)
        if img is None:
            # Try PIL fallback
            pil_img = Image.open(file_path).convert("RGB")
            img = np.array(pil_img)
        preprocessed = self._preprocess_image(img)
        config = r"--oem 3 --psm 6"
        return pytesseract.image_to_string(preprocessed, lang="eng", config=config)

    # ── Image Preprocessing ────────────────────────────────────────────────────

    def _preprocess_image(self, img: np.ndarray) -> np.ndarray:
        """
        Standard OCR preprocessing:
        grayscale → denoise → threshold → deskew
        """
        # Convert to grayscale
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        # Denoise
        denoised = cv2.fastNlMeansDenoising(gray, h=10)

        # Adaptive threshold for varying lighting
        thresh = cv2.adaptiveThreshold(
            denoised, 255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 31, 2
        )

        # Deskew
        coords = np.column_stack(np.where(thresh > 0))
        if len(coords) > 0:
            angle = cv2.minAreaRect(coords)[-1]
            if angle < -45:
                angle = -(90 + angle)
            else:
                angle = -angle
            if abs(angle) > 0.5:
                (h, w) = thresh.shape
                M = cv2.getRotationMatrix2D((w // 2, h // 2), angle, 1.0)
                thresh = cv2.warpAffine(thresh, M, (w, h),
                                        flags=cv2.INTER_CUBIC,
                                        borderMode=cv2.BORDER_REPLICATE)

        return thresh

    # ── Parameter Parsing ──────────────────────────────────────────────────────

    def _parse_parameters(self, text: str, gender: str = "both") -> dict:
        """
        Apply regex patterns to extract known medical parameters.
        Returns a dict of {key: {value, unit, normal_range, status, label}}.
        """
        text_lower = text.lower()
        results = {}

        for param_key, patterns in PARAM_PATTERNS.items():
            for pattern in patterns:
                match = re.search(pattern, text_lower, re.IGNORECASE)
                if match:
                    raw_val = match.group(1).replace(",", "")
                    try:
                        value = float(raw_val)
                    except ValueError:
                        continue

                    ref = NORMAL_RANGES.get(param_key, {})
                    unit = ref.get("unit", "")
                    label = ref.get("label", param_key)

                    # Determine applicable range
                    if gender in ("male", "female") and gender in ref:
                        lo, hi = ref[gender]
                    elif "both" in ref:
                        lo, hi = ref["both"]
                    else:
                        lo, hi = None, None

                    status = self._classify_status(value, lo, hi, param_key)
                    normal_range = f"{lo}–{hi} {unit}" if lo is not None else "N/A"

                    results[param_key] = {
                        "label": label,
                        "value": f"{value}",
                        "unit": unit,
                        "normal_range": normal_range,
                        "status": status,
                    }
                    break  # found by this pattern, skip others

        return results

    def _classify_status(self, value: float, lo, hi, key: str) -> str:
        """Classify a value as normal / low / high / critical."""
        if lo is None or hi is None:
            return "unknown"

        if value < lo:
            deviation = (lo - value) / lo
            return "critical" if deviation > 0.30 else "low"
        elif value > hi:
            deviation = (value - hi) / hi
            return "critical" if deviation > 0.30 else "high"
        return "normal"


# Singleton instance
ocr_service = OCRService()
