import logging
from typing import Any

from app.services.groq_service import GroqService

logger = logging.getLogger(__name__)


class CourseService:
    def __init__(self) -> None:
        self._groq = GroqService()

    async def recommend(
        self,
        target_role: str,
        missing_skills: list[str],
        existing_skills: list[str],
        experience_level: str = "Mid",
    ) -> dict[str, Any]:
        missing_str = ", ".join(missing_skills[:10]) if missing_skills else "general role skills"
        existing_str = ", ".join(existing_skills[:15]) if existing_skills else "none identified"

        prompt = f"""Generate a personalized learning roadmap for someone targeting the role: {target_role}.

Existing skills: {existing_str}
Skills to develop: {missing_str}
Experience level: {experience_level}

Return JSON with this exact structure:
{{
  "roadmap_summary": "2-3 sentence overview",
  "estimated_total_weeks": 12,
  "courses": [
    {{
      "title": "Course name",
      "provider": "Platform name",
      "skill_focus": "Primary skill",
      "difficulty": "Beginner|Intermediate|Advanced",
      "duration_weeks": 4,
      "description": "Brief description",
      "url_suggestion": "Search query or platform path"
    }}
  ],
  "learning_phases": [
    {{
      "phase": 1,
      "title": "Phase name",
      "duration_weeks": 4,
      "goals": ["goal1", "goal2"],
      "skills": ["skill1", "skill2"]
    }}
  ],
  "personalized_tips": ["tip1", "tip2", "tip3"]
}}

Include 5-6 courses and 3 learning phases. Be specific and practical."""

        try:
            result = await self._groq.generate_structured(prompt)
            result["target_role"] = target_role
            result["generated_by"] = "groq"
            return result
        except RuntimeError as exc:
            logger.warning("Groq unavailable, using fallback courses: %s", exc)
            return self._fallback_recommendations(target_role, missing_skills)

    def _fallback_recommendations(
        self, target_role: str, missing_skills: list[str]
    ) -> dict[str, Any]:
        courses = []
        for i, skill in enumerate(missing_skills[:6]):
            courses.append(
                {
                    "title": f"Master {skill}",
                    "provider": "Coursera / Udemy",
                    "skill_focus": skill,
                    "difficulty": "Intermediate" if i < 3 else "Advanced",
                    "duration_weeks": 3 + (i % 3),
                    "description": f"Comprehensive course to build proficiency in {skill} for {target_role} roles.",
                    "url_suggestion": f"https://www.coursera.org/search?query={skill.replace(' ', '%20')}",
                }
            )

        return {
            "target_role": target_role,
            "roadmap_summary": f"A structured path to become a {target_role}, focusing on your top skill gaps.",
            "estimated_total_weeks": sum(c["duration_weeks"] for c in courses),
            "courses": courses,
            "learning_phases": [
                {
                    "phase": 1,
                    "title": "Foundation",
                    "duration_weeks": 4,
                    "goals": ["Build core fundamentals", "Set up development environment"],
                    "skills": missing_skills[:2] if missing_skills else ["Fundamentals"],
                },
                {
                    "phase": 2,
                    "title": "Intermediate Skills",
                    "duration_weeks": 6,
                    "goals": ["Apply skills in projects", "Build portfolio pieces"],
                    "skills": missing_skills[2:5] if len(missing_skills) > 2 else missing_skills,
                },
                {
                    "phase": 3,
                    "title": "Job Ready",
                    "duration_weeks": 4,
                    "goals": ["Interview preparation", "Capstone project"],
                    "skills": missing_skills[5:8] if len(missing_skills) > 5 else ["Advanced topics"],
                },
            ],
            "personalized_tips": [
                f"Focus on the top missing skills for {target_role} roles first.",
                "Build 2-3 portfolio projects demonstrating your new skills.",
                "Join communities and contribute to open source in your target domain.",
            ],
            "generated_by": "fallback",
        }
