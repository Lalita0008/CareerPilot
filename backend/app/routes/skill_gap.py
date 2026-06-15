import logging

from fastapi import APIRouter, HTTPException

from app.schemas.responses import SkillGapRequest, SkillGapResponse, MissingSkill, RecommendedSkill
from app.services.session_store import session_store
from app.services.skill_gap_service import SkillGapService
from app.utils.role_mapping import map_career_to_role

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Skill Gap"])
skill_gap_service = SkillGapService()


@router.post("/skill-gap", response_model=SkillGapResponse)
async def analyze_skill_gap(body: SkillGapRequest) -> SkillGapResponse:
    skills = body.skills
    target_role = body.target_role
    session = None

    if body.session_id:
        session = session_store.get(body.session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        skills = skills or session.extracted_skills
        if not target_role:
            if session.target_role:
                target_role = session.target_role
            elif session.career_prediction:
                target_role = map_career_to_role(
                    session.career_prediction["top_career"],
                    skill_gap_service.list_roles(),
                )

    if not skills:
        raise HTTPException(status_code=400, detail="No skills provided")
    if not target_role:
        raise HTTPException(status_code=400, detail="No target role provided")

    result = skill_gap_service.get_skill_gap(skills, target_role, body.top_n)

    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])

    if session:
        session.skill_gap = result
        session.target_role = target_role
        session_store.update(session)

    return SkillGapResponse(
        target_role=result["target_role"],
        matched_skills=result["matched_skills"],
        missing_skills=[MissingSkill(**m) for m in result["missing_skills"]],
        recommended_skills=[RecommendedSkill(**r) for r in result["recommended_skills"]],
        gap_percentage=result["gap_percentage"],
        coverage_percentage=result["coverage_percentage"],
        available_roles=result["available_roles"],
    )
