"""
app/routers/chatbot.py
RAG chatbot endpoints — ask questions about a specific report.
"""
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import Report, ReportAnalysis, ChatHistory, Patient
from app.schemas.schemas import ChatMessageRequest, ChatMessageOut, ChatResponse
from app.services.rag_service import rag_service

router = APIRouter(prefix="/api/chatbot", tags=["Chatbot"])


@router.post("/ask", response_model=ChatResponse)
def ask_question(
    body: ChatMessageRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Ask a natural-language question about a specific report.
    The RAG service retrieves relevant context from the report's vector index.
    """
    # Verify report access
    report = db.query(Report).filter(Report.id == body.report_id).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    if current_user.role == "patient":
        patient = db.query(Patient).filter(Patient.user_id == current_user.id).first()
        if not patient or report.patient_id != patient.id:
            raise HTTPException(status_code=403, detail="Access denied")

    # Verify analysis exists
    analysis = db.query(ReportAnalysis).filter(
        ReportAnalysis.report_id == body.report_id
    ).first()
    if not analysis:
        raise HTTPException(
            status_code=400,
            detail="Report is still being analyzed. Please try again shortly."
        )

    # Ensure RAG index is loaded (re-index from DB if server restarted)
    if not rag_service.has_index(body.report_id):
        if analysis.raw_ocr_text:
            rag_service.index_report(body.report_id, analysis.raw_ocr_text)
        else:
            return ChatResponse(
                answer="I'm unable to find the report content. Please contact support.",
                report_id=body.report_id,
            )

    # Save user message to history
    db.add(ChatHistory(
        report_id=body.report_id,
        user_id=current_user.id,
        role="user",
        message=body.message,
    ))
    db.commit()

    # Get AI answer
    answer = rag_service.answer(body.report_id, current_user.id, body.message)

    # Save assistant response
    db.add(ChatHistory(
        report_id=body.report_id,
        user_id=current_user.id,
        role="assistant",
        message=answer,
    ))
    db.commit()

    return ChatResponse(answer=answer, report_id=body.report_id)


@router.get("/{report_id}/history", response_model=List[ChatMessageOut])
def get_chat_history(
    report_id: int,
    limit: int = 50,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Return the last N chat messages for a report."""
    history = (
        db.query(ChatHistory)
        .filter(
            ChatHistory.report_id == report_id,
            ChatHistory.user_id == current_user.id,
        )
        .order_by(ChatHistory.created_at.asc())
        .limit(limit)
        .all()
    )
    return history


@router.delete("/{report_id}/history", status_code=204)
def clear_chat(
    report_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Clear conversation history and in-memory RAG memory."""
    db.query(ChatHistory).filter(
        ChatHistory.report_id == report_id,
        ChatHistory.user_id == current_user.id,
    ).delete()
    db.commit()
    rag_service.clear_memory(report_id, current_user.id)
