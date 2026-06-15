import logging

from fastapi import APIRouter, HTTPException

from app.schemas.responses import AnalyticsResponse
from app.services.session_store import session_store

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics"])


@router.get("/analytics/{session_id}", response_model=AnalyticsResponse)
async def get_analytics(session_id: str) -> AnalyticsResponse:
    session = session_store.get(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    career_score = 0.0
    top_career = "Unknown"
    if session.career_prediction:
        career_score = session.career_prediction.get("confidence", 0)
        top_career = session.career_prediction.get("top_career", "Unknown")

    gap_pct = 100.0
    coverage = 0.0
    matched_count = len(session.extracted_skills)
    missing_count = 0

    if session.skill_gap:
        gap_pct = session.skill_gap.get("gap_percentage", 100)
        coverage = session.skill_gap.get("coverage_percentage", 0)
        matched_count = len(session.skill_gap.get("matched_skills", []))
        missing_count = len(session.skill_gap.get("missing_skills", []))

    learning_progress = min(100, coverage * 0.6 + (matched_count / max(matched_count + missing_count, 1)) * 40)

    skills_breakdown = {
        "extracted": len(session.extracted_skills),
        "matched": matched_count,
        "missing": missing_count,
        "recommended": len(session.skill_gap.get("recommended_skills", [])) if session.skill_gap else 0,
    }

    return AnalyticsResponse(
        session_id=session_id,
        career_match_score=career_score,
        top_career=top_career,
        skills_breakdown=skills_breakdown,
        skill_gap_percentage=gap_pct,
        coverage_percentage=coverage,
        learning_progress=round(learning_progress, 2),
        matched_skills_count=matched_count,
        missing_skills_count=missing_count,
    )
