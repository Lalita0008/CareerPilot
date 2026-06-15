import io
import os
import json
from dotenv import load_dotenv
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pdfplumber
import docx
from groq import Groq
load_dotenv()


from utils import (
    predict_career,
    extract_skills_from_resume,
    get_skill_gap,
    le
)

app = FastAPI(title="CareerPilot AI")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ── Resume Parser ─────────────────────────────────────────────────
def parse_resume(file_bytes: bytes, filename: str) -> str:

    if filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            return " ".join(page.extract_text() or "" for page in pdf.pages)

    elif filename.endswith(".docx"):
        doc = docx.Document(io.BytesIO(file_bytes))
        return " ".join(p.text for p in doc.paragraphs)

    else:
        raise HTTPException(status_code=400, detail="Only PDF and DOCX supported")


class SkillGapRequest(BaseModel):
    user_skills: list[str]
    target_role: str

class CourseRequest(BaseModel):
    missing_skills: list[str]

class RoadmapRequest(BaseModel):
    target_role: str
    current_skills: list[str]
    missing_skills: list[str] = None


# ── Routes ────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "CareerPilot AI backend is running"}


@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    file_bytes  = await file.read()
    resume_text = parse_resume(file_bytes, file.filename)

    career_predictions = predict_career(resume_text)
    extracted_skills   = extract_skills_from_resume(resume_text)

    return {
        "extracted_skills"  : extracted_skills,
        "career_predictions": career_predictions
    }


@app.post("/skill-gap")
def skill_gap(req: SkillGapRequest):
    result = get_skill_gap(req.user_skills, req.target_role)
    return result


@app.post("/recommend-courses")
def recommend_courses(req: CourseRequest):
    try:
        skills_str = ", ".join(req.missing_skills)

        prompt = f"""
        The user is missing these skills: {skills_str}

        For each skill recommend 2 online courses.
        Return JSON only.
        Format:
        {{
          "recommendations": [
            {{
              "skill": "skill name",
              "courses": [
                {{"name": "course name", "platform": "Coursera/Udemy/YouTube", "duration": "X weeks", "free": true}},
                {{"name": "course name", "platform": "Coursera/Udemy/YouTube", "duration": "X weeks", "free": false}}
              ]
            }}
          ]
        }}
        """

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content
        data = json.loads(raw)
        return {"recommendations": data.get("recommendations", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate course recommendations: {str(e)}")


@app.post("/career-roadmap")
def career_roadmap(req: RoadmapRequest):
    try:
        missing_skills = req.missing_skills
        if not missing_skills:
            gap_analysis = get_skill_gap(req.current_skills, req.target_role)
            if "error" not in gap_analysis:
                missing_skills = [s["skill"] for s in gap_analysis.get("missing_skills", [])]
            else:
                missing_skills = []

        skills_str = ", ".join(req.current_skills)
        missing_str = ", ".join(missing_skills) if missing_skills else "None"

        prompt = f"""
        You are an expert AI Career Advisor.
        Create a detailed step-by-step career roadmap for a user who wants to transition into the target role: "{req.target_role}".

        Current Skills: {skills_str}
        Missing Skills (to focus on): {missing_str}

        Design a sequential learning roadmap. It should contain 3 to 5 logical phases.
        For each phase, specify:
        1. "phase": The name of the phase
        2. "duration": Estimated duration (e.g. "2-3 weeks", "1 month")
        3. "topics": A list of specific concepts and skills to learn
        4. "milestones": A list of milestones/checklist items to complete
        5. "suggested_projects": A list of 1-2 suggested projects with descriptions that apply these skills

        Return JSON only. Do not include any other text.
        Format:
        {{
          "roadmap": [
            {{
              "phase": "Phase Name",
              "duration": "Duration (e.g., 3 weeks)",
              "topics": ["Topic A", "Topic B", "Topic C"],
              "milestones": ["Milestone A", "Milestone B"],
              "suggested_projects": ["Project A: short description", "Project B: short description"]
            }}
          ]
        }}
        """

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            response_format={"type": "json_object"}
        )

        raw = response.choices[0].message.content
        data = json.loads(raw)
        return {"roadmap": data.get("roadmap", [])}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate career roadmap: {str(e)}")


@app.get("/roles")
def get_roles():
    return {"roles": sorted(list(le.classes_))}


# ── Chat endpoint (AI Career Mentor) ─────────────────────────────
class ChatRequest(BaseModel):
    message: str
    history: list[dict] = []

@app.post("/chat")
def chat(req: ChatRequest):
    try:
        system = (
            "You are CareerPilot AI, an expert career advisor specializing in tech roles. "
            "Help users with career guidance, skill building, learning roadmaps, and interview preparation. "
            "Be concise, practical, and encouraging. Keep responses under 150 words."
        )
        messages = [{"role": "system", "content": system}] + req.history + [{"role": "user", "content": req.message}]

        response = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=messages,
            temperature=0.7
        )
        return {"reply": response.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Groq API Error: {str(e)}")
