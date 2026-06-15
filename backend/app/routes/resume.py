import logging
from pathlib import Path

from fastapi import APIRouter, File, HTTPException, UploadFile

from app.core.config import get_settings
from app.schemas.responses import UploadResumeResponse, ResumeStats
from app.services.session_store import session_store
from app.startup.model_loader import get_artifacts
from app.utils.resume_parser import compute_resume_stats, parse_resume
from app.utils.skill_extraction import extract_skills_from_text
from app.utils.text_cleaning import clean_resume

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Resume"])


@router.post("/upload-resume", response_model=UploadResumeResponse)
async def upload_resume(file: UploadFile = File(...)) -> UploadResumeResponse:
    settings = get_settings()
    ext = Path(file.filename or "").suffix.lower()

    if ext not in settings.allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type. Allowed: {', '.join(settings.allowed_extensions)}",
        )

    content = await file.read()
    max_bytes = settings.max_upload_size_mb * 1024 * 1024
    if len(content) > max_bytes:
        raise HTTPException(
            status_code=400,
            detail=f"File too large. Max size: {settings.max_upload_size_mb}MB",
        )

    try:
        raw_text = parse_resume(content, file.filename or "resume")
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc

    artifacts = get_artifacts()
    extracted_skills = extract_skills_from_text(raw_text, artifacts.skill_vocabulary)
    cleaned = clean_resume(raw_text)
    stats = compute_resume_stats(raw_text)

    settings.upload_dir.mkdir(parents=True, exist_ok=True)
    save_path = settings.upload_dir / f"{file.filename}"
    save_path.write_bytes(content)

    session = session_store.create(
        filename=file.filename or "resume",
        raw_text=raw_text,
        cleaned_text=cleaned,
        extracted_skills=extracted_skills,
        stats=stats,
    )

    logger.info("Resume uploaded: session=%s skills=%d", session.session_id, len(extracted_skills))

    return UploadResumeResponse(
        session_id=session.session_id,
        filename=session.filename,
        stats=ResumeStats(**stats),
        extracted_skills=[s.title() for s in extracted_skills],
        preview=raw_text[:500] + ("..." if len(raw_text) > 500 else ""),
    )
