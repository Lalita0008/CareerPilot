import re

from rapidfuzz import fuzz, process


def extract_skills_from_text(text: str, vocabulary: list[str], threshold: int = 85) -> list[str]:
    """Extract skills from resume text by fuzzy matching against trained vocabulary."""
    text_lower = text.lower()
    found: set[str] = set()

    for skill in vocabulary:
        if skill in text_lower:
            found.add(skill)

    tokens = re.split(r"[,;\n|•·\-–—/\\]", text_lower)
    token_phrases = [t.strip() for t in tokens if t.strip()]

    for phrase in token_phrases:
        if len(phrase) < 2:
            continue
        match = process.extractOne(phrase, vocabulary, scorer=fuzz.token_sort_ratio)
        if match and match[1] >= threshold:
            found.add(match[0])

    words = re.findall(r"[a-zA-Z+#.]+", text_lower)
    for i in range(len(words)):
        for j in range(i + 1, min(i + 4, len(words)) + 1):
            phrase = " ".join(words[i:j])
            if len(phrase) < 3:
                continue
            match = process.extractOne(phrase, vocabulary, scorer=fuzz.ratio)
            if match and match[1] >= threshold:
                found.add(match[0])

    return sorted(found)


def parse_skills_list(skills_input: list[str] | str) -> list[str]:
    """Reuse notebook skill parsing: comma-separated lowercase skills."""
    if isinstance(skills_input, str):
        return [x.strip().lower() for x in skills_input.split(",") if x.strip()]
    return [s.strip().lower() for s in skills_input if s.strip()]
