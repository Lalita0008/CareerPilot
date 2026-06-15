import asyncio
import json
import logging
from collections.abc import AsyncGenerator
from typing import Any

from groq import Groq

from app.core.config import get_settings

logger = logging.getLogger(__name__)

SYSTEM_PROMPT = """You are an expert AI Career Adviser. You help professionals with:
- Career path guidance and transitions
- Personalized learning roadmaps
- Resume improvement suggestions
- Technology and skill recommendations
- Interview preparation tips

Be concise, actionable, and encouraging. Use bullet points when listing steps.
Format responses in clear markdown when helpful."""


class GroqService:
    def __init__(self) -> None:
        settings = get_settings()
        self._model = settings.groq_model
        self._max_retries = settings.groq_max_retries
        self._client: Groq | None = None
        if settings.groq_api_key:
            self._client = Groq(api_key=settings.groq_api_key)

    @property
    def is_available(self) -> bool:
        return self._client is not None

    async def chat(
        self,
        messages: list[dict[str, str]],
        stream: bool = False,
    ) -> str | AsyncGenerator[str, None]:
        if not self._client:
            raise RuntimeError(
                "Groq API key not configured. Set GROQ_API_KEY in your .env file."
            )

        groq_messages = [{"role": "system", "content": SYSTEM_PROMPT}, *messages]

        if stream:
            return self._stream_chat(groq_messages)  # type: ignore[return-value]

        last_error: Exception | None = None
        for attempt in range(1, self._max_retries + 1):
            try:
                response = self._client.chat.completions.create(
                    model=self._model,
                    messages=groq_messages,
                    temperature=0.7,
                    max_tokens=2048,
                )
                return response.choices[0].message.content or ""
            except Exception as exc:
                last_error = exc
                logger.warning("Groq chat attempt %d failed: %s", attempt, exc)
                if attempt < self._max_retries:
                    await asyncio.sleep(2 ** attempt)

        raise RuntimeError(f"Groq chat failed: {last_error}")

    async def _stream_chat(
        self, messages: list[dict[str, str]]
    ) -> AsyncGenerator[str, None]:
        if not self._client:
            raise RuntimeError("Groq API key not configured.")

        stream = self._client.chat.completions.create(
            model=self._model,
            messages=messages,
            temperature=0.7,
            max_tokens=2048,
            stream=True,
        )

        for chunk in stream:
            delta = chunk.choices[0].delta.content
            if delta:
                yield delta

    async def generate_structured(
        self,
        prompt: str,
        system: str | None = None,
    ) -> dict[str, Any]:
        if not self._client:
            raise RuntimeError(
                "Groq API key not configured. Set GROQ_API_KEY in your .env file."
            )

        messages = [
            {
                "role": "system",
                "content": system
                or "You are a career learning advisor. Respond ONLY with valid JSON.",
            },
            {"role": "user", "content": prompt},
        ]

        last_error: Exception | None = None
        for attempt in range(1, self._max_retries + 1):
            try:
                response = self._client.chat.completions.create(
                    model=self._model,
                    messages=messages,
                    temperature=0.5,
                    max_tokens=3000,
                    response_format={"type": "json_object"},
                )
                content = response.choices[0].message.content or "{}"
                return json.loads(content)
            except json.JSONDecodeError as exc:
                logger.error("Failed to parse Groq JSON response: %s", exc)
                raise RuntimeError("Invalid JSON response from Groq") from exc
            except Exception as exc:
                last_error = exc
                logger.warning("Groq structured attempt %d failed: %s", attempt, exc)
                if attempt < self._max_retries:
                    await asyncio.sleep(2 ** attempt)

        raise RuntimeError(f"Groq structured generation failed: {last_error}")
