import logging
from typing import Any

from app.startup.model_loader import get_artifacts
from app.utils.text_cleaning import clean_resume

logger = logging.getLogger(__name__)


class CareerService:
    def predict(self, resume_text: str) -> dict[str, Any]:
        artifacts = get_artifacts()
        cleaned = clean_resume(resume_text)
        tfidf_matrix = artifacts.tfidf.transform([cleaned])
        probabilities = artifacts.career_model.predict_proba(tfidf_matrix)[0]
        classes = list(artifacts.career_model.classes_)

        ranked = sorted(
            zip(classes, probabilities),
            key=lambda x: x[1],
            reverse=True,
        )

        top_career, top_confidence = ranked[0]
        alternatives = [
            {
                "career": career,
                "confidence": round(float(conf) * 100, 2),
            }
            for career, conf in ranked[1:6]
        ]

        logger.info("Career prediction: %s (%.1f%%)", top_career, top_confidence * 100)

        return {
            "top_career": top_career,
            "confidence": round(float(top_confidence) * 100, 2),
            "alternatives": alternatives,
            "all_predictions": [
                {"career": c, "confidence": round(float(p) * 100, 2)}
                for c, p in ranked
            ],
        }
