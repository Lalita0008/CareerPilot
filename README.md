# 🚀 CareerPilot AI

<div align="center">

### AI-Powered Career Guidance Platform Driven by Machine Learning, NLP, and Generative AI

Transforming resumes into actionable career insights through intelligent career prediction, skill-gap analysis, personalized roadmaps, and AI-powered mentoring.

![Python](https://img.shields.io/badge/Python-3.10+-blue)
![FastAPI](https://img.shields.io/badge/FastAPI-Backend-green)
![React](https://img.shields.io/badge/React-Frontend-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC)
![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-ML-orange)
![TF-IDF](https://img.shields.io/badge/NLP-TF--IDF-red)
![Groq](https://img.shields.io/badge/Groq-LLM-purple)
![License](https://img.shields.io/badge/License-MIT-yellow)

</div>

---

# 📌 Project Overview

**CareerPilot AI** is an intelligent career guidance platform that leverages **Machine Learning, Natural Language Processing (NLP), and Generative AI** to help students and professionals make informed career decisions.

The platform analyzes resumes, predicts suitable career roles, identifies skill gaps, recommends learning resources, generates personalized career roadmaps, and provides AI-powered mentoring.

While the platform includes a modern full-stack web interface and AI assistant, the core of the project is a **custom-built Machine Learning pipeline** designed to transform unstructured resume data into meaningful career intelligence.

---

## Live Demo

🔗 **Link:** https://ai-career-adviser.netlify.app/
---

# 🎯 Key Features

### 📄 Resume Analysis

* Resume upload support (PDF & DOCX)
* Automated text extraction
* Resume preprocessing and cleaning
* Skill extraction from resume content

### 🤖 Machine Learning Career Prediction

* NLP-driven resume understanding
* TF-IDF feature engineering
* Career role classification
* Multi-role prediction support

### 📊 Skill Gap Analysis

* User skill extraction
* Role-based skill matching
* Missing skill identification
* Importance-weighted skill ranking

### 🛣 Personalized Career Roadmaps

* Career-specific growth plans
* Structured learning paths
* Actionable improvement recommendations

### 🎓 Course Recommendation Engine

* Learning resource suggestions
* Skill-focused course recommendations
* Upskilling guidance

### 💬 AI Career Mentor

* Interactive career guidance chatbot
* Personalized career advice
* Resume and interview support

### 📈 Interactive Dashboard

* Career insights visualization
* Prediction results
* Skill analysis reports

---

# 🧠 Machine Learning Engineering

## Data Collection & Preparation

The Machine Learning system was built using multiple career-related datasets focused on:

* Job roles
* Skills
* Career pathways
* Learning resources
* Industry requirements

### Data Cleaning Pipeline

Raw datasets underwent extensive preprocessing:

* Duplicate removal
* Missing value handling
* Text normalization
* Lowercase conversion
* Special character removal
* Noise reduction

### NLP Preprocessing

The resume processing pipeline includes:

* Tokenization
* Stopword removal
* Text cleaning
* Skill normalization
* Resume standardization

### Feature Engineering

To transform textual resume content into machine-readable representations:

* TF-IDF Vectorization
* Vocabulary generation
* Feature extraction
* Sparse matrix generation

This allows the model to learn relationships between resume content and career outcomes.

---

# 🎯 Career Prediction System

The career prediction engine is built using a supervised Machine Learning workflow.

## Workflow

### Step 1: Resume Processing

* Extract text from uploaded resume
* Clean and normalize content
* Remove noise and irrelevant terms

### Step 2: Feature Transformation

Convert resume text into numerical vectors using:

* TF-IDF Vectorizer

### Step 3: Label Encoding

Career roles are transformed into machine-readable labels using:

* Label Encoder

### Step 4: Model Training

The classifier learns relationships between:

* Resume content
* Skills
* Career labels

### Step 5: Prediction

Given a new resume:

* Text is preprocessed
* Features are vectorized
* Model predicts suitable career paths

---

# 🔍 Skill Gap Analysis Engine

One of the core innovations of CareerPilot AI is the Skill Gap Analysis Engine.

## How It Works

### Skill Extraction

Skills are identified from:

* Resume content
* User-provided skills
* NLP preprocessing outputs

### Role Mapping

The system maps extracted skills against:

* Industry requirements
* Target role competencies

### Missing Skill Detection

CareerPilot AI identifies:

* Missing technical skills
* Missing domain knowledge
* Recommended learning priorities

### Importance-Based Ranking

Skills are ranked based on:

* Frequency
* Relevance
* Career-role importance score

This enables personalized recommendations rather than generic advice.

---

# ⚙️ ML Architecture

```text
Resume
   │
   ▼
Text Extraction
   │
   ▼
Preprocessing
   │
   ▼
TF-IDF Vectorization
   │
   ▼
Career Prediction Model
   │
   ▼
Predicted Roles
   │
   ▼
Skill Gap Analysis
   │
   ▼
Missing Skills
   │
   ▼
Career Roadmap
   │
   ▼
Course Recommendations
```

---

# 🏗 Tech Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion

## Backend

* FastAPI
* Python
* Groq API

## Machine Learning

* Scikit-Learn
* Pandas
* NumPy
* Joblib
* TF-IDF Vectorizer
* Label Encoder

## NLP

* Text Cleaning
* Tokenization
* Stopword Removal
* Feature Extraction

---

# 📂 Project Structure

```bash
CareerPilot-AI/
│
├── backend/
│   ├── api/
│   ├── models/
│   │   ├── career_model.pkl
│   │   ├── tfidf_vectorizer.pkl
│   │   └── label_encoder.pkl
│   │
│   ├── services/
│   ├── utils/
│   ├── datasets/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── layouts/
│   │
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── README.md
├── .env.example
└── .gitignore
```

---

# 🚀 Installation

## Clone Repository

```bash
git clone https://github.com/Lalita0008/CareerPilot.git

cd CareerPilot
```

---

# Backend Setup

```bash
cd backend

python -m venv venv

source venv/bin/activate
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run backend:

```bash
uvicorn main:app --reload
```

---

# Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

---

# 🔐 Environment Variables

Create a `.env` file inside backend directory:

```env
GROQ_API_KEY=your_groq_api_key
```

---

# 📡 API Endpoints

## Resume Upload

```http
POST /upload-resume
```

Uploads and analyzes resume content.

---

## Skill Gap Analysis

```http
POST /skill-gap
```

Returns missing skills and recommendations.

---

## Course Recommendations

```http
POST /recommend-courses
```

Provides recommended learning resources.

---

## Career Roadmap

```http
POST /career-roadmap
```

Generates personalized growth plans.

---

## AI Career Mentor

```http
POST /chat
```

Interactive career guidance assistant.

---

## Available Roles

```http
GET /roles
```

Returns supported career roles.

---

# 📈 Results

CareerPilot AI enables:

### 🎯 Automated Career Prediction

Predicts suitable career paths directly from resume content.

### 📊 Personalized Skill Gap Analysis

Identifies missing skills required for target roles.

### 🛣 Learning Roadmaps

Provides structured career growth plans.

### 🎓 Smart Course Recommendations

Suggests relevant learning resources.

### 💬 AI Career Guidance

Offers personalized mentoring and career advice.

---

# 🔮 Future Enhancements

* User Authentication
* Resume Version Tracking
* Progress Monitoring Dashboard
* Real-Time Job Recommendations
* Personalized Learning Analytics
* Advanced Recommendation Models
* Cloud Deployment
* Mobile Application
* Continuous Model Retraining

---

# 👨‍💻 Author

**Lalita Jhapate**

AI & Machine Learning Enthusiast



---

## ⭐ If you found this project useful, consider giving it a star!

CareerPilot AI demonstrates how Machine Learning, NLP, and Generative AI can work together to transform raw resume data into personalized career intelligence.
