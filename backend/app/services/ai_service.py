"""
app/services/ai_service.py
AI-powered medical report analysis using Groq API + Llama 3.

Features:
  - Hallucination-prevention via rule-based pre-check
  - Structured prompt engineering
  - Health score computation
"""
import logging
from typing import Dict

from groq import Groq

from app.core.config import settings

logger = logging.getLogger(__name__)

# System prompt for the analysis model
ANALYSIS_SYSTEM_PROMPT = """You are MedAssist AI, a clinical report interpreter.
Your role is to explain medical lab reports in SIMPLE, NON-TECHNICAL language for patients.

STRICT RULES:
1. Only comment on values that are actually present in the report. 
2. NEVER invent values, symptoms, or diagnoses not present in the report data.
3. Keep explanations under 150 words per section.
4. Always recommend consulting a doctor for diagnosis and treatment.
5. Use plain English. Avoid jargon.
6. For critical values, clearly state this requires IMMEDIATE medical attention.
7. Be empathetic and reassuring in tone.
"""


class AIAnalysisService:
    """Handles all Groq/Llama-3 interactions for report analysis."""

    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL

    # ── Public API ─────────────────────────────────────────────────────────────

    def analyze_report(self, raw_text: str, parameters: dict) -> dict:
        """
        Main analysis pipeline:
        1. Rule-based status overview
        2. AI summary, explanation, recommendation
        3. Health score
        """
        overall_status = self._compute_overall_status(parameters)
        health_score = self._compute_health_score(parameters)

        # Format parameters for prompt
        param_block = self._format_params_for_prompt(parameters)

        summary      = self._generate_section("summary",      param_block, raw_text)
        explanation  = self._generate_section("explanation",  param_block, raw_text)
        recommendation = self._generate_section("recommendation", param_block, raw_text)

        return {
            "ai_summary":       summary,
            "ai_explanation":   explanation,
            "ai_recommendation": recommendation,
            "overall_status":   overall_status,
            "health_score":     health_score,
            "model_used":       self.model,
        }

    # ── Rule-based helpers ─────────────────────────────────────────────────────

    def _compute_overall_status(self, parameters: dict) -> str:
        """
        Rule-based: look at the worst status among extracted parameters.
        Order: critical > abnormal (high/low) > mild_abnormal > normal
        """
        statuses = [p.get("status", "normal") for p in parameters.values()]
        if "critical" in statuses:
            return "critical"
        if "high" in statuses or "low" in statuses:
            # Count how many are abnormal
            abnormal = sum(1 for s in statuses if s in ("high", "low", "critical"))
            if abnormal >= 3:
                return "abnormal"
            return "mild_abnormal"
        return "normal"

    def _compute_health_score(self, parameters: dict) -> int:
        """
        Score 0–100 based on ratio of normal parameters.
        Critical parameters subtract more points.
        """
        if not parameters:
            return 75  # default when no params extracted

        total = len(parameters)
        penalty = 0
        for p in parameters.values():
            s = p.get("status", "normal")
            if s == "critical":
                penalty += 20
            elif s in ("high", "low"):
                penalty += 10
            # normal = 0 penalty

        base_score = 100 - penalty
        return max(0, min(100, base_score))

    # ── Prompt helpers ─────────────────────────────────────────────────────────

    def _format_params_for_prompt(self, parameters: dict) -> str:
        if not parameters:
            return "No structured parameters could be extracted."
        lines = []
        for key, info in parameters.items():
            label = info.get("label", key)
            value = info.get("value", "N/A")
            unit  = info.get("unit", "")
            nrange = info.get("normal_range", "N/A")
            status = info.get("status", "unknown").upper()
            lines.append(f"  • {label}: {value} {unit}  [Normal: {nrange}]  → {status}")
        return "\n".join(lines)

    def _generate_section(self, section: str, param_block: str, raw_text: str) -> str:
        """
        Call Groq API for one section (summary | explanation | recommendation).
        Falls back to a safe default string on error.
        """
        prompts = {
            "summary": (
                f"Here are the extracted lab parameters:\n{param_block}\n\n"
                "Write a 2-3 sentence SUMMARY of this report for the patient. "
                "Mention which parameters are abnormal if any."
            ),
            "explanation": (
                f"Parameters:\n{param_block}\n\n"
                "Explain in SIMPLE LANGUAGE what each abnormal parameter means "
                "for the patient's health. If all are normal, say so briefly."
            ),
            "recommendation": (
                f"Parameters:\n{param_block}\n\n"
                "Give 3-4 practical, evidence-based health recommendations "
                "based ONLY on these results. End with advice to consult a doctor."
            ),
        }

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": ANALYSIS_SYSTEM_PROMPT},
                    {"role": "user",   "content": prompts[section]},
                ],
                max_tokens=300,
                temperature=0.3,  # low temp = more factual, less creative
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            logger.error(f"Groq API error for section '{section}': {e}")
            return self._fallback_text(section)

    def _fallback_text(self, section: str) -> str:
        fallbacks = {
            "summary": "Your report has been processed. Please consult your doctor for a detailed discussion.",
            "explanation": "Please consult your doctor who can explain each parameter in context of your health history.",
            "recommendation": "Please follow up with your doctor for personalised recommendations based on these results.",
        }
        return fallbacks.get(section, "Analysis unavailable. Please consult your doctor.")


# Singleton
ai_service = AIAnalysisService()
