from fastapi import APIRouter

from app.core.config import get_settings
from app.startup.model_loader import get_artifacts
from app.schemas.responses import HealthResponse

router = APIRouter(tags=["Health"])


@router.get("/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    settings = get_settings()
    models_loaded = False
    try:
        get_artifacts()
        models_loaded = True
    except RuntimeError:
        pass

    return HealthResponse(
        status="healthy" if models_loaded else "degraded",
        models_loaded=models_loaded,
        groq_configured=bool(settings.groq_api_key),
    )
