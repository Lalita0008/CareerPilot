import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface CareerPrediction { career: string; confidence: number }
interface MissingSkill { rank: number; skill: string; importance: number }
interface SkillGapResult { matched_skills: string[]; missing_skills: MissingSkill[] }
interface CourseItem { name: string; platform: string; duration: string; free: boolean }
interface CourseRec { skill: string; courses: CourseItem[] }

interface AppState {
  extractedSkills: string[]
  careerPredictions: CareerPrediction[]
  selectedRole: string
  skillGapResult: SkillGapResult | null
  courseRecs: CourseRec[]
  availableRoles: string[]
}

interface AppContextType extends AppState {
  setExtractedSkills: (s: string[]) => void
  setCareerPredictions: (p: CareerPrediction[]) => void
  setSelectedRole: (r: string) => void
  setSkillGapResult: (g: SkillGapResult | null) => void
  setCourseRecs: (c: CourseRec[]) => void
  setAvailableRoles: (r: string[]) => void
  clearAllState: () => void
}

const AppContext = createContext<AppContextType | null>(null)

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const val = localStorage.getItem(key)
    return val ? JSON.parse(val) : fallback
  } catch {
    return fallback
  }
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [extractedSkills, setExtractedSkills] = useState<string[]>(() => loadFromStorage('extractedSkills', []))
  const [careerPredictions, setCareerPredictions] = useState<CareerPrediction[]>(() => loadFromStorage('careerPredictions', []))
  const [selectedRole, setSelectedRole] = useState(() => localStorage.getItem('selectedRole') || '')
  const [skillGapResult, setSkillGapResult] = useState<SkillGapResult | null>(() => loadFromStorage('skillGapResult', null))
  const [courseRecs, setCourseRecs] = useState<CourseRec[]>(() => loadFromStorage('courseRecs', []))
  const [availableRoles, setAvailableRoles] = useState<string[]>(() => loadFromStorage('availableRoles', []))

  useEffect(() => {
    localStorage.setItem('extractedSkills', JSON.stringify(extractedSkills))
  }, [extractedSkills])

  useEffect(() => {
    localStorage.setItem('careerPredictions', JSON.stringify(careerPredictions))
  }, [careerPredictions])

  useEffect(() => {
    localStorage.setItem('selectedRole', selectedRole)
  }, [selectedRole])

  useEffect(() => {
    localStorage.setItem('skillGapResult', JSON.stringify(skillGapResult))
  }, [skillGapResult])

  useEffect(() => {
    localStorage.setItem('courseRecs', JSON.stringify(courseRecs))
  }, [courseRecs])

  useEffect(() => {
    localStorage.setItem('availableRoles', JSON.stringify(availableRoles))
  }, [availableRoles])

  const clearAllState = () => {
    setExtractedSkills([])
    setCareerPredictions([])
    setSelectedRole('')
    setSkillGapResult(null)
    setCourseRecs([])
    // We keep availableRoles as it is static data fetched from backend
  }

  return (
    <AppContext.Provider value={{
      extractedSkills, setExtractedSkills,
      careerPredictions, setCareerPredictions,
      selectedRole, setSelectedRole,
      skillGapResult, setSkillGapResult,
      courseRecs, setCourseRecs,
      availableRoles, setAvailableRoles,
      clearAllState
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be inside AppProvider')
  return ctx
}
