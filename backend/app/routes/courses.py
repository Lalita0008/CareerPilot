import logging

from fastapi import APIRouter, HTTPException

from app.schemas.responses import (
    CourseRecommendationRequest,
    CourseRecommendationResponse,
    CourseItem,
    LearningPhase,
)
from app.services.course_service import CourseService
from app.services.session_store import session_store
from app.utils.role_mapping import map_career_to_role
from app.services.skill_gap_service import SkillGapService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Courses"])
course_service = CourseService()
skill_gap_service = SkillGapService()


@router.post("/course-recommendation", response_model=CourseRecommendationResponse)
async def recommend_courses(body: CourseRecommendationRequest) -> CourseRecommendationResponse:
    target_role = body.target_role
    missing_skills = body.missing_skills or []
    existing_skills = body.existing_skills or []

    if body.session_id:
        session = session_store.get(body.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")

        existing_skills = existing_skills or [s.title() for s in session.extracted_skills]

        if not target_role:
            if session.target_role:
                target_role = session.target_role
            elif session.career_prediction:
                target_role = map_career_to_role(
                    session.career_prediction["top_career"],
                    skill_gap_service.list_roles(),
                )

        if not missing_skills and session.skill_gap:
            missing_skills = [m["skill"] for m in session.skill_gap.get("missing_skills", [])]

    if not target_role:
        raise HTTPException(status_code=400, detail="Target role is required")

    result = await course_service.recommend(
        target_role=target_role,
        missing_skills=missing_skills,
        existing_skills=existing_skills,
        experience_level=body.experience_level,
    )

    return CourseRecommendationResponse(
        target_role=result["target_role"],
        roadmap_summary=result["roadmap_summary"],
        estimated_total_weeks=result["estimated_total_weeks"],
        courses=[CourseItem(**c) for c in result["courses"]],
        learning_phases=[LearningPhase(**p) for p in result["learning_phases"]],
        personalized_tips=result["personalized_tips"],
        generated_by=result.get("generated_by", "groq"),
    )
