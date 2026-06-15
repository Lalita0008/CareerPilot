import uuid
from dataclasses import dataclass, field
from typing import Any


@dataclass
class ResumeSession:
    session_id: str
    filename: str
    raw_text: str
    cleaned_text: str
    extracted_skills: list[str]
    stats: dict[str, Any]
    career_prediction: dict[str, Any] | None = None
    skill_gap: dict[str, Any] | None = None
    target_role: str | None = None
    chat_history: list[dict[str, str]] = field(default_factory=list)


class SessionStore:
    def __init__(self) -> None:
        self._sessions: dict[str, ResumeSession] = {}

    def create(
        self,
        filename: str,
        raw_text: str,
        cleaned_text: str,
        extracted_skills: list[str],
        stats: dict[str, Any],
    ) -> ResumeSession:
        session_id = str(uuid.uuid4())
        session = ResumeSession(
            session_id=session_id,
            filename=filename,
            raw_text=raw_text,
            cleaned_text=cleaned_text,
            extracted_skills=extracted_skills,
            stats=stats,
        )
        self._sessions[session_id] = session
        return session

    def get(self, session_id: str) -> ResumeSession | None:
        return self._sessions.get(session_id)

    def update(self, session: ResumeSession) -> None:
        self._sessions[session.session_id] = session


session_store = SessionStore()
