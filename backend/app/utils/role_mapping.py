"""Career category to skill-gap job role mapping with fuzzy fallback."""

from rapidfuzz import process

CAREER_TO_ROLE_MAP: dict[str, str] = {
    "Data Science": "Data Scientist",
    "Python Developer": "Full Stack Python Developer",
    "Java Developer": "Full Stack Java Developer",
    "DevOps Engineer": "DevOps Engineer",
    "Web Designing": "Frontend Developer",
    "DotNet Developer": "C# Developer",
    "Blockchain": "Blockchain Developer",
    "Business Analyst": "Data Analyst",
    "Testing": "Web Developer",
    "Automation Testing": "Web Developer",
    "Network Security Engineer": "Cybersecurity Engineer",
    "Database": "Backend Developer",
    "Hadoop": "Data Analyst",
    "ETL Developer": "Data Analyst",
    "SAP Developer": "Backend Developer",
    "PMO": "Software Project Manager",
    "HR": "HR",
    "Sales": "Marketing",
    "Operations Manager": "Software Project Manager",
}


def map_career_to_role(career: str, available_roles: list[str]) -> str:
    if career in CAREER_TO_ROLE_MAP:
        mapped = CAREER_TO_ROLE_MAP[career]
        if mapped in available_roles:
            return mapped

    match = process.extractOne(career, available_roles)
    if match and match[1] >= 50:
        return match[0]

    return available_roles[0] if available_roles else career
