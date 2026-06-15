import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCareerRoadmap } from '../services/api'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ArrowRight, Target, AlertCircle, Clock, BookOpen, 
  CheckCircle2, Briefcase, Loader2, Sparkles, X, Check
} from 'lucide-react'

interface Phase {
  phase: string
  duration: string
  topics: string[]
  milestones: string[]
  suggested_projects?: string[]
  suggestedProjects?: string[]
}

export default function CareerPaths() {
  const navigate = useNavigate()
  const { careerPredictions, extractedSkills, selectedRole, setSelectedRole, skillGapResult } = useApp()

  const [activeRoadmapRole, setActiveRoadmapRole] = useState<string | null>(null)
  const [loadingRoadmap, setLoadingRoadmap] = useState<boolean>(false)
  const [roadmapError, setRoadmapError] = useState<string | null>(null)
  const [roadmaps, setRoadmaps] = useState<Record<string, Phase[]>>(() => {
    try {
      const saved = localStorage.getItem('career_roadmaps')
      return saved ? JSON.parse(saved) : {}
    } catch {
      return {}
    }
  })

  if (careerPredictions.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle size={40} className="text-gray-600 mb-4" />
        <p className="text-gray-400 mb-4">No predictions yet. Upload your resume first.</p>
        <button onClick={() => navigate('/resume')} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
          Upload Resume
        </button>
      </div>
    )
  }

  const top = careerPredictions[0]

  const handleViewRoadmap = async (role: string) => {
    setActiveRoadmapRole(role)
    setRoadmapError(null)

    if (roadmaps[role]) {
      return
    }

    setLoadingRoadmap(true)
    try {
      let missingList: string[] | undefined = undefined
      if (selectedRole === role && skillGapResult?.missing_skills) {
        missingList = skillGapResult.missing_skills.map(s => s.skill)
      }

      const res = await getCareerRoadmap(role, extractedSkills, missingList)
      if (res && res.roadmap) {
        const updated = { ...roadmaps, [role]: res.roadmap }
        setRoadmaps(updated)
        localStorage.setItem('career_roadmaps', JSON.stringify(updated))
      } else {
        throw new Error("Invalid response format")
      }
    } catch (err: any) {
      console.error(err)
      setRoadmapError("Failed to generate the roadmap. Groq API might be currently unavailable or overloaded. Please try again.")
    } finally {
      setLoadingRoadmap(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 120 } }
  }

  return (
    <div className="p-8 max-w-3xl pb-24">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Module 02</p>
      <h1 className="text-3xl font-bold text-white mb-2">Career Paths</h1>
      <p className="text-gray-400 mb-8">Your AI-predicted career matches based on your resume.</p>

      {/* Top match */}
      <div className="glass rounded-xl p-6 mb-6 flex flex-col md:flex-row items-start md:items-center gap-5">
        <div className="w-16 h-16 rounded-full border-2 border-purple-500 flex items-center justify-center flex-shrink-0">
          <span className="text-purple-400 font-bold text-sm">{top.confidence.toFixed(0)}%</span>
        </div>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Best match for your profile</p>
          <h2 className="text-xl font-bold text-white mb-1">{top.career}</h2>
          <p className="text-gray-400 text-sm">Based on skills extracted from your resume</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto flex-shrink-0 mt-3 md:mt-0">
          <button
            onClick={() => {
              setSelectedRole(top.career)
              navigate('/skill-gaps')
            }}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white border border-white/10 text-sm rounded-lg transition-colors"
          >
            Analyze gap <ArrowRight size={14} />
          </button>
          <button
            onClick={() => handleViewRoadmap(top.career)}
            className="flex-1 md:flex-initial flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors font-medium shadow-lg shadow-purple-900/30"
          >
            <Sparkles size={14} /> Roadmap
          </button>
        </div>
      </div>

      {/* All predictions */}
      <div className="glass rounded-xl p-6 mb-8">
        <div className="flex items-center gap-2 mb-5">
          <Target size={15} className="text-purple-400" />
          <h3 className="text-white font-semibold">All career matches</h3>
        </div>
        <div className="space-y-5">
          {careerPredictions.map((p, i) => (
            <div key={p.career} className="border-b border-white/5 pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center justify-between text-sm mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 text-xs w-4">{i + 1}</span>
                  <span className="text-gray-200 font-medium">{p.career}</span>
                </div>
                <span className="text-purple-400 font-medium">{p.confidence.toFixed(1)}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full"
                  style={{ width: `${p.confidence}%` }}
                />
              </div>
              <div className="flex gap-4 justify-end text-xs">
                <button
                  onClick={() => {
                    setSelectedRole(p.career)
                    navigate('/skill-gaps')
                  }}
                  className="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-1"
                >
                  Analyze gap <ArrowRight size={10} />
                </button>
                <span className="text-white/10">|</span>
                <button
                  onClick={() => handleViewRoadmap(p.career)}
                  className="text-purple-300 hover:text-purple-200 font-medium transition-colors flex items-center gap-1"
                >
                  <Sparkles size={11} /> View Roadmap
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roadmap Section */}
      <AnimatePresence mode="wait">
        {activeRoadmapRole && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="glass rounded-xl p-6 border border-purple-500/20"
          >
            <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
              <div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">AI Generated</span>
                <h3 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                  Roadmap: <span className="text-purple-400">{activeRoadmapRole}</span>
                </h3>
              </div>
              <button 
                onClick={() => setActiveRoadmapRole(null)}
                className="p-1.5 hover:bg-white/5 rounded-lg text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {loadingRoadmap ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <Loader2 className="animate-spin text-purple-500 mb-4" size={36} />
                <p className="text-gray-300 font-medium">Drafting your customized transition plan...</p>
                <p className="text-xs text-gray-500 mt-1">Analyzing current skills and mapping milestones with Groq Llama 3</p>
              </div>
            ) : roadmapError ? (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={18} />
                <div>
                  <h4 className="text-sm font-semibold text-red-400">Unable to generate roadmap</h4>
                  <p className="text-xs text-red-300/80 mt-1">{roadmapError}</p>
                  <button 
                    onClick={() => handleViewRoadmap(activeRoadmapRole)}
                    className="mt-3 px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded transition-colors"
                  >
                    Retry Request
                  </button>
                </div>
              </div>
            ) : roadmaps[activeRoadmapRole] ? (
              <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="relative border-l border-purple-500/20 ml-3 pl-6 space-y-8"
              >
                {roadmaps[activeRoadmapRole].map((phase, idx) => {
                  const topics = phase.topics || []
                  const milestones = phase.milestones || []
                  const projects = phase.suggested_projects || phase.suggestedProjects || []

                  return (
                    <motion.div 
                      key={idx} 
                      variants={itemVariants}
                      className="relative group"
                    >
                      {/* Timeline circle indicator */}
                      <span className="absolute -left-[31px] top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-purple-600 ring-4 ring-[#13111C]">
                        <Check size={10} className="text-white" />
                      </span>

                      {/* Content Panel */}
                      <div className="glass hover:border-purple-500/30 transition-all duration-300 p-5 rounded-xl">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                          <h4 className="text-md font-bold text-white group-hover:text-purple-300 transition-colors">
                            {phase.phase}
                          </h4>
                          <span className="flex items-center gap-1 text-xs text-purple-300 bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-full">
                            <Clock size={12} /> {phase.duration}
                          </span>
                        </div>

                        {/* Grid container for detail columns */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
                          {/* Topics Column */}
                          {topics.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <BookOpen size={12} className="text-purple-400" /> Focus Topics
                              </span>
                              <ul className="space-y-1.5">
                                {topics.map((t, i) => (
                                  <li key={i} className="text-gray-300 text-xs flex items-start gap-1">
                                    <span className="text-purple-500 mt-1">•</span> {t}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Milestones Column */}
                          {milestones.length > 0 && (
                            <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3">
                              <span className="text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                                <CheckCircle2 size={12} className="text-green-400" /> Milestones
                              </span>
                              <ul className="space-y-1.5">
                                {milestones.map((m, i) => (
                                  <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                                    <CheckCircle2 size={11} className="text-purple-500/60 mt-0.5 flex-shrink-0" />
                                    <span>{m}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>

                        {/* Projects (Full Width Row) */}
                        {projects.length > 0 && (
                          <div className="bg-purple-950/10 border border-purple-500/10 rounded-lg p-3 mt-4">
                            <span className="text-xs text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2">
                              <Briefcase size={12} className="text-purple-400" /> Suggested Projects
                            </span>
                            <ul className="space-y-2">
                              {projects.map((p, i) => (
                                <li key={i} className="text-xs text-gray-300 leading-relaxed bg-[#13111C]/40 p-2 rounded border border-white/[0.02]">
                                  {p}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
