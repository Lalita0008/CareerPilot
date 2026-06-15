import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { getSkillGap, getRoles } from '../services/api'
import { CheckCircle, XCircle, AlertCircle, ArrowRight, ChevronDown } from 'lucide-react'

export default function SkillGaps() {
  const navigate = useNavigate()
  const {
    extractedSkills, selectedRole, setSelectedRole,
    skillGapResult, setSkillGapResult, availableRoles, setAvailableRoles
  } = useApp()

  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')

  // Load roles on mount
  useEffect(() => {
    if (availableRoles.length === 0) {
      getRoles()
        .then((data) => setAvailableRoles(data.roles))
        .catch(() => {})
    }
  }, [])

  const analyze = async () => {
    if (!selectedRole || extractedSkills.length === 0) return
    setLoading(true)
    setError('')
    try {
      const data = await getSkillGap(extractedSkills, selectedRole)
      if (data && data.error) {
        setError(data.error)
        setSkillGapResult(null)
      } else {
        setSkillGapResult(data)
      }
    } catch {
      setError('Failed to analyze. Make sure backend is running.')
      setSkillGapResult(null)
    } finally {
      setLoading(false)
    }
  }

  // Auto-analyze gap when target role changes
  useEffect(() => {
    if (selectedRole && extractedSkills.length > 0) {
      // Validate that the role is available before analyzing, to show a clean validation message
      if (availableRoles.length > 0 && !availableRoles.includes(selectedRole)) {
        setError(`The role "${selectedRole}" is not supported for skill gap analysis. Please select another role.`)
        setSkillGapResult(null)
        return
      }
      analyze()
    }
  }, [selectedRole, availableRoles])


  if (extractedSkills.length === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[60vh] text-center">
        <AlertCircle size={40} className="text-gray-600 mb-4" />
        <p className="text-gray-400 mb-4">Upload your resume first to extract skills.</p>
        <button onClick={() => navigate('/resume')} className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors">
          Upload Resume
        </button>
      </div>
    )
  }

  const hasValidResult = 
    skillGapResult && 
    !('error' in skillGapResult) && 
    Array.isArray(skillGapResult.matched_skills) && 
    Array.isArray(skillGapResult.missing_skills)

  const total = hasValidResult 
    ? skillGapResult.matched_skills.length + skillGapResult.missing_skills.length 
    : 0

  const matchPct = (hasValidResult && total > 0)
    ? Math.round((skillGapResult.matched_skills.length / total) * 100)
    : 0

  return (
    <div className="p-8 max-w-3xl">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Module 03</p>
      <h1 className="text-3xl font-bold text-white mb-2">Skill Gap Analysis</h1>
      <p className="text-gray-400 mb-8">Select a target role to see what skills you have and what you need.</p>

      {/* Role selector */}
      <div className="glass rounded-xl p-5 mb-6">
        <p className="text-xs text-gray-500 mb-2">Target role</p>
        <div className="relative">
          <select
            value={selectedRole}
            onChange={(e) => {
              setError('')
              setSelectedRole(e.target.value)
            }}
            className="w-full bg-white/5 border border-purple-900/30 text-white rounded-lg px-4 py-2.5 text-sm appearance-none cursor-pointer focus:outline-none focus:border-purple-600"
          >
            <option value="" disabled>Select a role...</option>
            {availableRoles.map((r) => (
              <option key={r} value={r} className="bg-[#111111]">{r}</option>
            ))}
          </select>
          <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>
        <button
          onClick={analyze}
          disabled={!selectedRole || loading}
          className="mt-3 w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Analyzing...' : 'Analyze Gap'}
        </button>
      </div>

      {error && (
        <div className="mb-4 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      {hasValidResult && skillGapResult && (
        <>
          {/* Match bar */}
          <div className="glass rounded-xl p-5 mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Overall match for <span className="text-purple-400">{selectedRole}</span></span>
              <span className="text-white font-medium">{matchPct}%</span>
            </div>
            <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full transition-all duration-700"
                style={{ width: `${matchPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Matched skills */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle size={14} className="text-green-400" />
                <p className="text-green-400 text-sm font-medium">Skills you have ({skillGapResult.matched_skills.length})</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillGapResult.matched_skills.map((s) => (
                  <span key={s} className="px-2.5 py-1 bg-green-500/10 border border-green-500/20 text-green-400 text-xs rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing skills */}
            <div className="glass rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <XCircle size={14} className="text-red-400" />
                <p className="text-red-400 text-sm font-medium">Missing skills ({skillGapResult.missing_skills.length})</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {skillGapResult.missing_skills.map((s) => (
                  <span key={s.skill} className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-full">
                    {s.skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/courses')}
            className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            Get Course Recommendations <ArrowRight size={16} />
          </button>
        </>
      )}
    </div>
  )
}
