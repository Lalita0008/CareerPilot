import { useNavigate } from 'react-router-dom'
import { Compass, Brain, GitCompare, BookOpen, MessageCircle, ArrowRight, Zap } from 'lucide-react'

const features = [
  { icon: Brain,         title: 'Career Prediction',   desc: 'AI predicts your ideal career from your resume with confidence scores.' },
  { icon: GitCompare,    title: 'Skill Gap Analysis',  desc: 'See exactly which skills you have and which you need for your target role.' },
  { icon: BookOpen,      title: 'Course Recommendations', desc: 'Get personalized course suggestions powered by Groq LLM.' },
  { icon: MessageCircle, title: 'AI Career Mentor',    desc: 'Chat with an AI career advisor for guidance, roadmaps and prep.' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">

      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-700/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-purple-900/20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center">
            <Compass size={16} className="text-white" />
          </div>
          <span className="text-white font-semibold text-lg">CareerPilot <span className="text-purple-400">AI</span></span>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
        >
          Get Started <ArrowRight size={14} />
        </button>
      </nav>

      {/* Hero */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6 pt-24 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-600/10 border border-purple-600/20 text-purple-400 text-xs mb-6">
          <Zap size={12} /> Powered by AI + Groq LLM
        </div>
        <h1 className="text-5xl font-bold text-white leading-tight mb-4">
          AI Career <span className="text-purple-400">Adviser</span>
        </h1>
        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto">
          Upload your resume and discover your ideal career path powered by AI.
          Get skill gap analysis, course recommendations and career mentoring.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => navigate('/resume')}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-all hover:glow flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 font-medium rounded-lg transition-colors"
          >
            View Dashboard
          </button>
        </div>
      </div>

      {/* Features */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-2 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="glass rounded-xl p-6 hover:border-purple-500/30 transition-all duration-300 group"
            >
              <div className="w-10 h-10 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4 group-hover:bg-purple-600/30 transition-colors">
                <Icon size={20} className="text-purple-400" />
              </div>
              <h3 className="text-white font-semibold mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
