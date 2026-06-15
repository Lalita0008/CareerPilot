import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getCourseRecommendations } from '../services/api'
import { BookOpen, ExternalLink, AlertCircle, Tag } from 'lucide-react'

export default function Courses() {
  const navigate  = useNavigate()
  const { skillGapResult, courseRecs, setCourseRecs } = useApp()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  const hasValidResult = 
    skillGapResult && 
    !('error' in skillGapResult) && 
    Array.isArray(skillGapResult.matched_skills) && 
    Array.isArray(skillGapResult.missing_skills)

  const missing = hasValidResult 
    ? skillGapResult.missing_skills.map((s) => s.skill) 
    : []
  const missingKey = missing.join(',')

  // Auto-fetch recommendations when user lands on page with missing skills
  useEffect(() => {
    if (courseRecs.length === 0 && missing.length > 0) {
      fetchCourses()
    }
  }, [missingKey])

  const fetchCourses = async () => {
    if (missing.length === 0) return
    setLoading(true)
    setError('')
    try {
      const data = await getCourseRecommendations(missing)
      setCourseRecs(data.recommendations)
    } catch {
      setError('Failed to get recommendations. Make sure backend is running.')
    } finally {
      setLoading(false)
    }
  }

  if (missing.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle size={40} className="text-gray-600 mb-4" />
        <p className="text-gray-400 mb-4">Run skill gap analysis first to get course recommendations.</p>
        <button onClick={() => navigate('/skill-gaps')} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
          Go to Skill Gaps
        </button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-3xl">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Module 04</p>
      <h1 className="text-3xl font-bold text-white mb-2">Recommended Courses</h1>
      <p className="text-gray-400 mb-2">Based on your missing skills:</p>

      {/* Missing skill tags */}
      <div className="flex flex-wrap gap-2 mb-6">
        {missing.map((s) => (
          <span key={s} className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full flex items-center gap-1">
            <Tag size={10} /> {s}
          </span>
        ))}
      </div>

      {/* Fetch button */}
      {courseRecs.length === 0 && (
        <button
          onClick={fetchCourses}
          disabled={loading}
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-medium rounded-lg transition-colors mb-6"
        >
          {loading ? 'Getting recommendations from Groq...' : 'Get AI Course Recommendations'}
        </button>
      )}

      {error && (
        <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {/* Course cards */}
      {courseRecs.map(({ skill, courses }) => (
        <div key={skill} className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={15} className="text-purple-400" />
            <h3 className="text-white font-semibold">{skill}</h3>
          </div>
          <div className="space-y-3">
            {courses.map((c) => (
              <div key={c.name} className="glass rounded-xl p-4 flex items-start justify-between gap-4 hover:border-purple-500/30 transition-all">
                <div className="flex-1">
                  <p className="text-white text-sm font-medium mb-1">{c.name}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{c.platform}</span>
                    <span>·</span>
                    <span>{c.duration}</span>
                    <span>·</span>
                    <span className={c.free ? 'text-green-400' : 'text-yellow-400'}>
                      {c.free ? 'Free' : 'Paid'}
                    </span>
                  </div>
                </div>
                <a
                  href={`https://www.google.com/search?q=${encodeURIComponent(c.platform + ' ' + c.name)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-purple-400 hover:text-purple-300 text-xs transition-colors flex-shrink-0"
                >
                  View <ExternalLink size={11} />
                </a>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Refresh */}
      {courseRecs.length > 0 && (
        <button
          onClick={fetchCourses}
          disabled={loading}
          className="mt-2 w-full py-2.5 bg-white/5 hover:bg-white/10 border border-purple-900/30 text-gray-400 text-sm rounded-lg transition-colors"
        >
          {loading ? 'Refreshing...' : 'Refresh Recommendations'}
        </button>
      )}
    </div>
  )
}
