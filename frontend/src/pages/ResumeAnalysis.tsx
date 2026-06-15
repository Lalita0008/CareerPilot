import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, RotateCcw } from 'lucide-react'
import { uploadResume } from '../services/api'
import { useApp } from '../context/AppContext'

export default function ResumeAnalysis() {
  const navigate = useNavigate()
  const { setExtractedSkills, setCareerPredictions, clearAllState } = useApp()

  const [dragging, setDragging]   = useState(false)
  const [file, setFile]           = useState<File | null>(null)
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [done, setDone]           = useState(false)
  const [skills, setSkills]       = useState<string[]>(() => {
    // Sync local skills state with AppContext on load
    const stored = localStorage.getItem('extractedSkills')
    return stored ? JSON.parse(stored) : []
  })
  const [progressStep, setProgressStep] = useState('')

  // Sync component done status with AppContext state on mount
  useState(() => {
    const stored = localStorage.getItem('extractedSkills')
    if (stored && JSON.parse(stored).length > 0) {
      setDone(true)
    }
  })

  const handleFile = (f: File) => {
    if (!f.name.match(/\.(pdf|docx)$/i)) {
      setError('Only PDF and DOCX files are supported.')
      return
    }
    setFile(f)
    setError('')
    setDone(false)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) handleFile(f)
  }

  const analyze = async () => {
    if (!file) return
    setLoading(true)
    setError('')
    try {
      setProgressStep('Uploading document...')
      await new Promise(r => setTimeout(r, 600))
      setProgressStep('Extracting skills & cleaning text...')
      await new Promise(r => setTimeout(r, 600))
      setProgressStep('Running ML career predictions...')
      await new Promise(r => setTimeout(r, 600))

      const data = await uploadResume(file)
      setExtractedSkills(data.extracted_skills)
      setCareerPredictions(data.career_predictions)
      setSkills(data.extracted_skills)
      setDone(true)
    } catch {
      setError('Failed to analyze resume. Make sure the backend is running.')
    } finally {
      setLoading(false)
      setProgressStep('')
    }
  }

  const reset = () => {
    clearAllState()
    setFile(null)
    setDone(false)
    setSkills([])
    setError('')
  }

  return (
    <div className="p-8 max-w-3xl">
      {/* Header */}
      <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Module 01</p>
      <h1 className="text-3xl font-bold text-white mb-2">Resume Analysis</h1>
      <p className="text-gray-400 mb-8">Upload a PDF or DOCX. We extract skills, predict careers and detect gaps.</p>

      {/* Upload zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 cursor-pointer
          ${dragging ? 'border-purple-500 bg-purple-600/10' : 'border-purple-900/40 bg-white/[0.02] hover:border-purple-700/50'}`}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          accept=".pdf,.docx"
          className="hidden"
          onChange={onInputChange}
        />
        <div className="w-16 h-16 rounded-xl bg-purple-600/20 flex items-center justify-center mx-auto mb-4">
          <Upload size={28} className="text-purple-400" />
        </div>

        {file ? (
          <div>
            <div className="flex items-center justify-center gap-2 text-white font-medium mb-1">
              <FileText size={16} className="text-purple-400" />
              {file.name}
            </div>
            <p className="text-gray-500 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div>
            <p className="text-white font-medium mb-1">Drop your resume here</p>
            <p className="text-gray-500 text-sm">or click to choose · PDF, DOCX · max 5MB</p>
          </div>
        )}
      </div>

      {/* Choose file button */}
      {!done && (
        <button
          onClick={() => document.getElementById('file-input')?.click()}
          disabled={loading}
          className="mt-4 w-full py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Upload size={16} /> Choose file
        </button>
      )}

      {/* Analyze button */}
      {file && !done && (
        <button
          onClick={analyze}
          disabled={loading}
          className="mt-3 w-full py-3 bg-white/5 hover:bg-white/10 border border-purple-600/30 text-purple-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
              <span>{progressStep}</span>
            </div>
          ) : (
            'Analyze Resume'
          )}
        </button>
      )}

      {/* Error */}
      {error && (
        <div className="mt-4 flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
          <AlertCircle size={15} /> {error}
        </div>
      )}

      {/* Success result */}
      {done && (
        <div className="mt-6">
          <div className="flex items-center gap-2 text-green-400 text-sm mb-4">
            <CheckCircle size={16} /> Resume analyzed successfully
          </div>

          <div className="glass rounded-xl p-5 mb-4">
            <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">Skills extracted ({skills.length})</p>
            <div className="flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="px-3 py-1 bg-purple-600/20 border border-purple-600/30 text-purple-300 text-xs rounded-full">
                  {s}
                </span>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <button
              onClick={reset}
              className="flex-1 py-3 bg-white/5 hover:bg-white/10 border border-purple-900/30 text-gray-300 font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw size={15} /> Upload Another
            </button>
            <button
              onClick={() => navigate('/careers')}
              className="flex-[2] py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 hover:glow transition-all"
            >
              View Career Predictions <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* What we extract */}
      {!done && (
        <div className="mt-6 glass rounded-xl p-5">
          <p className="text-xs text-gray-500 uppercase tracking-widest mb-3">What we extract</p>
          {['Skills & technologies', 'Work experience', 'Education background', 'Projects & certifications'].map((item) => (
            <div key={item} className="flex items-center gap-2 text-gray-400 text-sm py-1">
              <CheckCircle size={13} className="text-purple-500" /> {item}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
