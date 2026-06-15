import logging

from fastapi import APIRouter, HTTPException

from app.schemas.responses import CareerPredictionResponse, CareerAlternative
from app.services.career_service import CareerService
from app.services.session_store import session_store
from app.utils.role_mapping import map_career_to_role
from app.services.skill_gap_service import SkillGapService

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Career"])
career_service = CareerService()
skill_gap_service = SkillGapService()


from pydantic import BaseModel


class PredictCareerRequest(BaseModel):
    session_id: str | None = None
    resume_text: str | None = None


@router.post("/predict-career", response_model=CareerPredictionResponse)
async def predict_career(body: PredictCareerRequest):
    session_id = body.session_id
    resume_text = body.resume_text
    text = resume_text
    session = None

    if session_id:
        session = session_store.get(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        text = session.raw_text

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Provide session_id or resume_text",
        )

    result = career_service.predict(text)

    if session:
        session.career_prediction = result
        session.target_role = map_career_to_role(
            result["top_career"],
            skill_gap_service.list_roles(),
        )
        session_store.update(session)

    return CareerPredictionResponse(
        top_career=result["top_career"],
        confidence=result["confidence"],
        alternatives=[CareerAlternative(**a) for a in result["alternatives"]],
        session_id=session_id,
    )
