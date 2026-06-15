import re
import joblib
import nltk
from rapidfuzz import process, fuzz

nltk.download('stopwords', quiet=True)
from nltk.corpus import stopwords

# ── Load all model artifacts ─────────────────────────────────────
tfidf              = joblib.load("models/tfidf_vectorizer.pkl")
career_model       = joblib.load("models/career_model.pkl")
per_role_importance = joblib.load("models/per_role_importance.pkl")
le                 = joblib.load("models/skill_gap_label_encoder.pkl")
all_skills         = joblib.load("models/skill_vocabulary.pkl")

stop_words = set(stopwords.words('english'))


# ── Resume Cleaning (same as career.ipynb) ───────────────────────
def clean_resume(text: str) -> str:
    text = str(text)
    text = re.sub(r'http\S+', ' ', text)
    text = re.sub(r'@\w+', ' ', text)
    text = re.sub(r'#\w+', ' ', text)
    text = re.sub(r'[^a-zA-Z\s]', ' ', text)
    text = text.lower()
    words = [w for w in text.split() if w not in stop_words]
    return " ".join(words)


# ── Career Prediction ────────────────────────────────────────────
def predict_career(resume_text: str, top_n: int = 5) -> list:
    cleaned = clean_resume(resume_text)
    vector  = tfidf.transform([cleaned])
    probs   = career_model.predict_proba(vector)[0]

    results = sorted(
        zip(career_model.classes_, probs),
        key=lambda x: x[1],
        reverse=True
    )[:top_n]

    return [
        {"career": career, "confidence": round(float(prob) * 100, 2)}
        for career, prob in results
    ]


# ── Skill Normalization ──────────────────────────────────────────
def normalize_skill(skill: str) -> str:
    skill = skill.lower().strip()
    skill = re.sub(r'\b(v?\d+[\.\d]*x?)\b', '', skill)
    skill = re.sub(r'[-_]', ' ', skill)
    skill = re.sub(r'[^a-z0-9\.\s]', '', skill)
    skill = re.sub(r'\s+', ' ', skill).strip()
    return skill


def match_skill_to_vocab(skill: str, threshold: int = 80) -> str:
    normalized = normalize_skill(skill)

    if normalized in all_skills:
        return normalized

    result = process.extractOne(
        normalized,
        all_skills,
        scorer=fuzz.token_sort_ratio,
        score_cutoff=threshold
    )
    return result[0] if result else None


# ── Skill Extraction from Resume ─────────────────────────────────
def extract_skills_from_resume(resume_text: str) -> list:
    text = resume_text.lower()
    return [skill for skill in all_skills if skill in text]


# ── Skill Gap Analysis ───────────────────────────────────────────
def get_skill_gap(user_skills: list, target_role: str, top_n: int = 8) -> dict:

    if target_role not in le.classes_:
        return {"error": f"Role not found. Available: {list(le.classes_)}"}

    # normalize user skills against vocabulary
    user_vocab = []
    for skill in user_skills:
        matched = match_skill_to_vocab(skill)
        if matched:
            user_vocab.append(matched)

    importance = per_role_importance[target_role]

    # skills user already has
    matched_skills = [
        skill.title() for skill, score in importance.items()
        if skill in user_vocab and score > 0
    ]

    # missing skills ranked by importance
    missing = sorted(
        [(skill, score) for skill, score in importance.items()
         if skill not in user_vocab and score > 0],
        key=lambda x: x[1],
        reverse=True
    )[:top_n]

    return {
        "matched_skills": matched_skills,
        "missing_skills": [
            {
                "rank": i + 1,
                "skill": skill.title(),
                "importance": round(score * 100, 2)
            }
            for i, (skill, score) in enumerate(missing)
        ]
    }
