from pydantic import BaseModel, Field


class CareerAlternative(BaseModel):
    career: str
    confidence: float


class CareerPredictionResponse(BaseModel):
    top_career: str
    confidence: float
    alternatives: list[CareerAlternative]
    session_id: str | None = None


class MissingSkill(BaseModel):
    rank: int
    skill: str
    importance: float


class RecommendedSkill(BaseModel):
    skill: str
    importance: float


class SkillGapRequest(BaseModel):
    session_id: str | None = None
    skills: list[str] | None = None
    target_role: str | None = None
    top_n: int = Field(default=8, ge=1, le=20)


class SkillGapResponse(BaseModel):
    target_role: str
    matched_skills: list[str]
    missing_skills: list[MissingSkill]
    recommended_skills: list[RecommendedSkill]
    gap_percentage: float
    coverage_percentage: float
    available_roles: list[str]


class CourseRecommendationRequest(BaseModel):
    session_id: str | None = None
    target_role: str | None = None
    missing_skills: list[str] | None = None
    existing_skills: list[str] | None = None
    experience_level: str = "Mid"


class CourseItem(BaseModel):
    title: str
    provider: str
    skill_focus: str
    difficulty: str
    duration_weeks: int
    description: str
    url_suggestion: str


class LearningPhase(BaseModel):
    phase: int
    title: str
    duration_weeks: int
    goals: list[str]
    skills: list[str]


class CourseRecommendationResponse(BaseModel):
    target_role: str
    roadmap_summary: str
    estimated_total_weeks: int
    courses: list[CourseItem]
    learning_phases: list[LearningPhase]
    personalized_tips: list[str]
    generated_by: str = "groq"


class ChatMessage(BaseModel):
    role: str
    content: str


class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    history: list[ChatMessage] = Field(default_factory=list)
    stream: bool = False


class ChatResponse(BaseModel):
    reply: str
    session_id: str | None = None


class ResumeStats(BaseModel):
    word_count: int
    character_count: int
    line_count: int
    section_indicators: int
    estimated_pages: int


class UploadResumeResponse(BaseModel):
    session_id: str
    filename: str
    stats: ResumeStats
    extracted_skills: list[str]
    preview: str
    message: str = "Resume parsed successfully"


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    groq_configured: bool


class AnalyticsResponse(BaseModel):
    session_id: str
    career_match_score: float
    top_career: str
    skills_breakdown: dict[str, int]
    skill_gap_percentage: float
    coverage_percentage: float
    learning_progress: float
    matched_skills_count: int
    missing_skills_count: int
