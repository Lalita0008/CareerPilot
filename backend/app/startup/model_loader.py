import logging
from dataclasses import dataclass
from pathlib import Path

import joblib

logger = logging.getLogger(__name__)


@dataclass
class MLArtifacts:
    tfidf: object
    career_model: object
    skill_gap_model: object
    skill_gap_label_encoder: object
    skill_vocabulary: list[str]
    per_role_importance: dict


_artifacts: MLArtifacts | None = None


def load_models(models_dir: Path) -> MLArtifacts:
    global _artifacts
    if _artifacts is not None:
        return _artifacts

    logger.info("Loading ML artifacts from %s", models_dir)

    _artifacts = MLArtifacts(
        tfidf=joblib.load(models_dir / "tfidf_vectorizer.pkl"),
        career_model=joblib.load(models_dir / "career_model.pkl"),
        skill_gap_model=joblib.load(models_dir / "skill_gap_model.pkl"),
        skill_gap_label_encoder=joblib.load(models_dir / "skill_gap_label_encoder.pkl"),
        skill_vocabulary=joblib.load(models_dir / "skill_vocabulary.pkl"),
        per_role_importance=joblib.load(models_dir / "per_role_importance.pkl"),
    )

    logger.info(
        "Loaded career model (%d classes), skill vocabulary (%d skills)",
        len(_artifacts.career_model.classes_),
        len(_artifacts.skill_vocabulary),
    )
    return _artifacts


def get_artifacts() -> MLArtifacts:
    if _artifacts is None:
        raise RuntimeError("ML artifacts not loaded. Call load_models() at startup.")
    return _artifacts
