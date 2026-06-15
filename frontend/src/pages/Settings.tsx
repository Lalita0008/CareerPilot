import { useState } from 'react'
import { Settings as SettingsIcon, Info, Server } from 'lucide-react'
import { updateApiBaseURL } from '../services/api'

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(
    localStorage.getItem('api_base_url') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
  )
  const [saved, setSaved] = useState(false)

  const save = () => {
    updateApiBaseURL(apiUrl)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-8 max-w-2xl">
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Configuration</p>
      <h1 className="text-3xl font-bold text-white mb-8">Settings</h1>

      {/* Backend config */}
      <div className="glass rounded-xl p-6 mb-4">
        <div className="flex items-center gap-2 mb-4">
          <Server size={15} className="text-purple-400" />
          <h2 className="text-white font-semibold">Backend Connection</h2>
        </div>
        <p className="text-xs text-gray-500 mb-2">API Base URL</p>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          className="w-full bg-white/5 border border-purple-900/30 text-white rounded-lg px-4 py-2.5 text-sm outline-none focus:border-purple-600/50 mb-3"
        />
        <button
          onClick={save}
          className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-colors"
        >
          {saved ? 'Saved!' : 'Save'}
        </button>
        <p className="text-xs text-gray-600 mt-3">
          Set VITE_API_BASE_URL in your .env file to make this permanent.
        </p>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Info size={15} className="text-purple-400" />
          <h2 className="text-white font-semibold">About</h2>
        </div>
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex justify-between"><span>Project</span><span className="text-white">CareerPilot AI</span></div>
          <div className="flex justify-between"><span>Career Model</span><span className="text-white">TF-IDF + Logistic Regression</span></div>
          <div className="flex justify-between"><span>Skill Gap Model</span><span className="text-white">OVR + Random Forest</span></div>
          <div className="flex justify-between"><span>LLM</span><span className="text-white">Groq (llama3-8b-8192)</span></div>
          <div className="flex justify-between"><span>Backend</span><span className="text-white">FastAPI + Python</span></div>
          <div className="flex justify-between"><span>Frontend</span><span className="text-white">React + TypeScript + Tailwind</span></div>
        </div>
      </div>
    </div>
  )
}
