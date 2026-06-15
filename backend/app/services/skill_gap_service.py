import logging
from typing import Any

from app.startup.model_loader import get_artifacts

logger = logging.getLogger(__name__)


class SkillGapService:
    def get_skill_gap(
        self,
        user_skills: list[str],
        target_role: str,
        top_n: int = 8,
    ) -> dict[str, Any]:
        """Reuse notebook skill gap implementation."""
        artifacts = get_artifacts()
        le = artifacts.skill_gap_label_encoder
        per_role_importance = artifacts.per_role_importance

        if target_role not in le.classes_:
            return {"error": "Role not found.", "available_roles": list(le.classes_)}

        user_lower = [s.strip().lower() for s in user_skills]
        importance = per_role_importance[target_role]

        matched = [
            skill.title()
            for skill, score in importance.items()
            if skill in user_lower and score > 0
        ]

        missing = sorted(
            [
                (skill, score)
                for skill, score in importance.items()
                if skill not in user_lower and score > 0
            ],
            key=lambda x: x[1],
            reverse=True,
        )[:top_n]

        recommended = sorted(
            [
                (skill, score)
                for skill, score in importance.items()
                if skill not in user_lower and score > 0
            ],
            key=lambda x: x[1],
            reverse=True,
        )[:top_n + 4]

        total_important = sum(1 for _, score in importance.items() if score > 0)
        gap_pct = round(
            (len(missing) / total_important * 100) if total_important else 0,
            2,
        )

        logger.info(
            "Skill gap for %s: %d matched, %d missing",
            target_role,
            len(matched),
            len(missing),
        )

        return {
            "target_role": target_role,
            "matched_skills": matched,
            "missing_skills": [
                {
                    "rank": i + 1,
                    "skill": skill.title(),
                    "importance": round(score * 100, 2),
                }
                for i, (skill, score) in enumerate(missing)
            ],
            "recommended_skills": [
                {
                    "skill": skill.title(),
                    "importance": round(score * 100, 2),
                }
                for skill, score in recommended
            ],
            "gap_percentage": gap_pct,
            "coverage_percentage": round(100 - gap_pct, 2),
            "available_roles": list(le.classes_),
        }

    def list_roles(self) -> list[str]:
        return list(get_artifacts().skill_gap_label_encoder.classes_)
