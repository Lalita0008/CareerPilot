import re

import nltk
from nltk.corpus import stopwords

_stop_words: set[str] | None = None


def _ensure_stopwords() -> set[str]:
    global _stop_words
    if _stop_words is None:
        try:
            nltk.data.find("corpora/stopwords")
        except LookupError:
            nltk.download("stopwords", quiet=True)
        _stop_words = set(stopwords.words("english"))
    return _stop_words


def clean_resume(text: str) -> str:
    """Reuse notebook preprocessing pipeline for career prediction."""
    text = str(text)
    text = re.sub(r"http\S+", " ", text)
    text = re.sub(r"@\w+", " ", text)
    text = re.sub(r"#\w+", " ", text)
    text = re.sub(r"[^a-zA-Z\s]", " ", text)
    text = text.lower()
    words = text.split()
    stop_words = _ensure_stopwords()
    words = [word for word in words if word not in stop_words]
    return " ".join(words)
