import { useState, useRef, useEffect } from 'react'
import { sendChatMessage } from '../services/api'
import { Send, MessageCircle, User, Bot } from 'lucide-react'

interface Message { role: 'user' | 'assistant'; content: string }

const suggestions = [
  'What skills should I learn for Data Science?',
  'Create a 30-day ML study plan for me.',
  'How do I transition from developer to data scientist?',
  'What interview questions should I practice?',
]

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Hi! I am CareerPilot AI, your personal career mentor. Ask me about career paths, skill building, interview prep, or learning roadmaps.' }
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text?: string) => {
    const msg = text || input.trim()
    if (!msg || loading) return

    const userMsg: Message = { role: 'user', content: msg }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }))
      const data    = await sendChatMessage(msg, history)
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', content: 'Sorry, I could not connect to the backend. Please make sure the server is running.' }])
    } finally {
      setLoading(false)
    }
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="flex flex-col h-screen p-6">
      {/* Header */}
      <div className="mb-4">
        <p className="text-xs text-purple-400 uppercase tracking-widest mb-1">Module 05</p>
        <h1 className="text-2xl font-bold text-white">AI Career Assistant</h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={14} className="text-purple-400" />
              </div>
            )}
            <div
              className={`max-w-[75%] px-4 py-3 rounded-xl text-sm leading-relaxed
                ${m.role === 'user'
                  ? 'bg-purple-600/30 border border-purple-600/20 text-white'
                  : 'bg-white/[0.04] border border-white/[0.07] text-gray-200'
                }`}
            >
              {renderMessageContent(m.content)}
            </div>
            {m.role === 'user' && (
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={14} className="text-gray-400" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 justify-start">
            <div className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center flex-shrink-0 mt-1">
              <Bot size={14} className="text-purple-400" />
            </div>
            <div className="bg-white/[0.04] border border-white/[0.07] px-4 py-3 rounded-xl">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length < 2 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs px-3 py-1.5 glass rounded-full text-gray-400 hover:text-purple-300 hover:border-purple-500/30 transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKey}
          placeholder="Ask about your career path..."
          className="flex-1 bg-white/[0.04] border border-white/10 focus:border-purple-600/50 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm outline-none transition-colors"
        />
        <button
          onClick={() => send()}
          disabled={!input.trim() || loading}
          className="w-11 h-11 bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </div>
    </div>
  )
}

function renderMessageContent(content: string) {
  // Split content by code blocks (```code```)
  const parts = content.split(/(```[\s\S]*?```)/g);

  return parts.map((part, index) => {
    if (part.startsWith('```')) {
      const code = part.replace(/```[a-zA-Z]*\n?|```$/g, '');
      return (
        <pre key={index} className="bg-black/40 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto font-mono text-xs text-purple-200">
          <code>{code}</code>
        </pre>
      );
    }

    // Process line by line for lists, bolding, and standard breaks
    const lines = part.split('\n');
    return (
      <div key={index} className="space-y-1.5">
        {lines.map((line, lIdx) => {
          const cleanedLine = line.trim();

          // Bullet point lists
          if (cleanedLine.startsWith('- ') || cleanedLine.startsWith('* ')) {
            return (
              <ul key={lIdx} className="list-disc pl-5 my-0.5 space-y-1">
                <li className="text-gray-300">
                  {parseInlineFormatting(cleanedLine.substring(2))}
                </li>
              </ul>
            );
          }

          // Numbered lists
          const matchNum = cleanedLine.match(/^(\d+)\.\s(.*)/);
          if (matchNum) {
            return (
              <ol key={lIdx} className="list-decimal pl-5 my-0.5 space-y-1">
                <li className="text-gray-300" value={parseInt(matchNum[1], 10)}>
                  {parseInlineFormatting(matchNum[2])}
                </li>
              </ol>
            );
          }

          // Regular lines
          return line ? (
            <p key={lIdx} className="text-gray-200">
              {parseInlineFormatting(line)}
            </p>
          ) : (
            <div key={lIdx} className="h-1" />
          );
        })}
      </div>
    );
  });
}

function parseInlineFormatting(text: string) {
  // Bold formatting: **text**
  const regex = /(\*\*.*?\*\*)/g;
  const parts = text.split(regex);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-semibold text-purple-300">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}
