import axios from 'axios'

const getBaseURL = () => {
  return localStorage.getItem('api_base_url') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
}

export const api = axios.create({
  baseURL: getBaseURL()
})

export const updateApiBaseURL = (url: string) => {
  api.defaults.baseURL = url
  localStorage.setItem('api_base_url', url)
}


// Upload resume → extract skills + career predictions
export const uploadResume = async (file: File) => {
  const form = new FormData()
  form.append('file', file)
  const res = await api.post('/upload-resume', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

// Get skill gap for a target role
export const getSkillGap = async (userSkills: string[], targetRole: string) => {
  const res = await api.post('/skill-gap', {
    user_skills: userSkills,
    target_role: targetRole
  })
  return res.data
}

// Get course recommendations for missing skills
export const getCourseRecommendations = async (missingSkills: string[]) => {
  const res = await api.post('/recommend-courses', {
    missing_skills: missingSkills
  })
  return res.data
}

// Get all available job roles
export const getRoles = async () => {
  const res = await api.get('/roles')
  return res.data
}

// Get career roadmap for a target role
export const getCareerRoadmap = async (targetRole: string, currentSkills: string[], missingSkills?: string[]) => {
  const res = await api.post('/career-roadmap', {
    target_role: targetRole,
    current_skills: currentSkills,
    missing_skills: missingSkills
  })
  return res.data
}

// Chat with AI career mentor
export const sendChatMessage = async (message: string, history: { role: string; content: string }[]) => {
  const res = await api.post('/chat', { message, history })
  return res.data
}
