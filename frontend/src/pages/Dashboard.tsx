import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { FileText, Target, GitCompare, BookOpen, ArrowRight, TrendingUp } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts'
import { motion } from 'framer-motion'

export default function Dashboard() {
  const navigate = useNavigate()
  const { extractedSkills, careerPredictions, skillGapResult } = useApp()

  const hasValidResult = 
    skillGapResult && 
    !('error' in skillGapResult) && 
    Array.isArray(skillGapResult.matched_skills) && 
    Array.isArray(skillGapResult.missing_skills)

  const topCareer    = careerPredictions[0] ?? null
  const missingCount = hasValidResult ? skillGapResult.missing_skills.length : 0
  const matchedCount = hasValidResult ? skillGapResult.matched_skills.length : 0

  const stats = [
    { label: 'Top Career Match', value: topCareer ? topCareer.career : '—', sub: topCareer ? `${topCareer.confidence.toFixed(1)}% confidence` : 'Upload resume first', color: 'text-purple-400' },
    { label: 'Skills Extracted', value: extractedSkills.length || '—', sub: extractedSkills.length ? 'from your resume' : 'Upload resume first', color: 'text-blue-400' },
    { label: 'Skills Matched',   value: matchedCount || '—', sub: hasValidResult ? 'for target role' : 'Run skill gap first', color: 'text-green-400' },
    { label: 'Missing Skills',   value: missingCount || '—', sub: hasValidResult ? 'need to learn' : 'Run skill gap first', color: 'text-red-400' },
  ]

  const quickActions = [
    { icon: FileText,   label: 'Analyze Resume',    to: '/resume',     desc: 'Upload and parse your resume'  },
    { icon: Target,     label: 'View Career Paths', to: '/careers',    desc: 'See your career predictions'   },
    { icon: GitCompare, label: 'Check Skill Gap',   to: '/skill-gaps', desc: 'Find what skills you are missing' },
    { icon: BookOpen,   label: 'Get Courses',        to: '/courses',    desc: 'AI-recommended courses'        },
  ]

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mb-8"
      >
        <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Overview</p>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">Your AI career analysis at a glance.</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, sub, color }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="glass rounded-xl p-5 hover:border-purple-500/20 hover:scale-[1.02] transition-all duration-300"
          >
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${color} mb-1`}>{value}</p>
            <p className="text-xs text-gray-500">{sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Career predictions bar chart */}
      {careerPredictions.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          className="glass rounded-xl p-6 mb-6"
        >
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-purple-400" />
            <h2 className="text-white font-semibold">Career Match Scores</h2>
          </div>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={careerPredictions.slice(0, 5)}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
              >
                <XAxis type="number" stroke="#4b5563" domain={[0, 100]} />
                <YAxis
                  dataKey="career"
                  type="category"
                  stroke="#9ca3af"
                  width={150}
                  tickLine={false}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[#111] border border-purple-500/20 rounded-lg p-2.5 shadow-lg">
                          <p className="text-white font-medium">{data.career}</p>
                          <p className="text-purple-400 font-semibold">{data.confidence.toFixed(1)}% Match</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="confidence" fill="#8B5CF6" radius={[0, 4, 4, 0]}>
                  {careerPredictions.slice(0, 5).map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`url(#colorGradient-${index})`}
                    />
                  ))}
                </Bar>
                <defs>
                  {careerPredictions.slice(0, 5).map((entry, index) => (
                    <linearGradient id={`colorGradient-${index}`} x1="0" y1="0" x2="1" y2="0" key={index}>
                      <stop offset="0%" stopColor="#7C3AED" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#C084FC" stopOpacity={0.9} />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4">
        {quickActions.map(({ icon: Icon, label, to, desc }, i) => (
          <motion.button
            key={to}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 + i * 0.05 }}
            onClick={() => navigate(to)}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className="glass rounded-xl p-5 text-left hover:border-purple-500/30 hover:glow-sm transition-all duration-200 group"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-purple-600/20 flex items-center justify-center group-hover:bg-purple-600/30 transition-colors">
                <Icon size={17} className="text-purple-400" />
              </div>
              <ArrowRight size={14} className="text-gray-600 group-hover:text-purple-400 transition-colors" />
            </div>
            <p className="text-white font-medium text-sm mb-1">{label}</p>
            <p className="text-gray-500 text-xs">{desc}</p>
          </motion.button>
        ))}
      </div>
    </div>
  )
}

