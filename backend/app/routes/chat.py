import json
import logging

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.schemas.responses import ChatRequest, ChatResponse, ChatMessage
from app.services.groq_service import GroqService
from app.services.session_store import session_store

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Chat"])
groq_service = GroqService()


@router.post("/chat")
async def chat(body: ChatRequest):
    if not body.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    messages = [{"role": m.role, "content": m.content} for m in body.history]

    session = None
    if body.session_id:
        session = session_store.get(body.session_id)
        if session and session.chat_history:
            messages = session.chat_history + messages

    context_prefix = ""
    if session:
        parts = []
        if session.career_prediction:
            parts.append(
                f"Predicted career: {session.career_prediction['top_career']} "
                f"({session.career_prediction['confidence']}% confidence)"
            )
        if session.extracted_skills:
            parts.append(f"Resume skills: {', '.join(session.extracted_skills[:20])}")
        if session.skill_gap:
            missing = [m["skill"] for m in session.skill_gap.get("missing_skills", [])[:5]]
            parts.append(f"Skill gaps: {', '.join(missing)}")
        if parts:
            context_prefix = "User context:\n" + "\n".join(parts) + "\n\n"

    user_message = {"role": "user", "content": context_prefix + body.message}
    full_messages = messages + [user_message]

    if body.stream:
        async def event_generator():
            try:
                stream = await groq_service.chat(full_messages, stream=True)
                full_reply = ""
                async for token in stream:  # type: ignore[union-attr]
                    full_reply += token
                    yield f"data: {json.dumps({'token': token})}\n\n"
                yield f"data: {json.dumps({'done': True, 'reply': full_reply})}\n\n"

                if session:
                    session.chat_history.append(user_message)
                    session.chat_history.append({"role": "assistant", "content": full_reply})
                    session_store.update(session)
            except RuntimeError as exc:
                yield f"data: {json.dumps({'error': str(exc)})}\n\n"

        return StreamingResponse(event_generator(), media_type="text/event-stream")

    try:
        reply = await groq_service.chat(full_messages, stream=False)
        assert isinstance(reply, str)

        if session:
            session.chat_history.append(user_message)
            session.chat_history.append({"role": "assistant", "content": reply})
            session_store.update(session)

        return ChatResponse(reply=reply, session_id=body.session_id)
    except RuntimeError as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc
