import io
import logging
from pathlib import Path

import pdfplumber
from docx import Document

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    text_parts: list[str] = []
    with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)
    return "\n".join(text_parts)


def extract_text_from_docx(file_bytes: bytes) -> str:
    doc = Document(io.BytesIO(file_bytes))
    return "\n".join(p.text for p in doc.paragraphs if p.text.strip())


def parse_resume(file_bytes: bytes, filename: str) -> str:
    ext = Path(filename).suffix.lower()
    if ext == ".pdf":
        text = extract_text_from_pdf(file_bytes)
    elif ext == ".docx":
        text = extract_text_from_docx(file_bytes)
    else:
        raise ValueError(f"Unsupported file type: {ext}")

    if not text.strip():
        raise ValueError("Could not extract text from the uploaded resume.")

    logger.info("Parsed resume '%s' (%d chars)", filename, len(text))
    return text


def compute_resume_stats(text: str) -> dict:
    words = text.split()
    lines = [ln for ln in text.splitlines() if ln.strip()]
    skill_indicators = sum(
        1
        for kw in ("skills", "experience", "education", "projects", "certification")
        if kw in text.lower()
    )
    return {
        "word_count": len(words),
        "character_count": len(text),
        "line_count": len(lines),
        "section_indicators": skill_indicators,
        "estimated_pages": max(1, round(len(words) / 400)),
    }
