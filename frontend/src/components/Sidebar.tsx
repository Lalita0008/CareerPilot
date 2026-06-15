import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, Target,
  GitCompare, BookOpen, MessageCircle, Settings, Compass
} from 'lucide-react'

const links = [
  { to: '/dashboard',        icon: LayoutDashboard, label: 'Dashboard'       },
  { to: '/resume',           icon: FileText,         label: 'Resume Analysis' },
  { to: '/careers',          icon: Target,           label: 'Career Paths'    },
  { to: '/skill-gaps',       icon: GitCompare,       label: 'Skill Gaps'      },
  { to: '/courses',          icon: BookOpen,         label: 'Courses'         },
  { to: '/assistant',        icon: MessageCircle,    label: 'AI Assistant'    },
  { to: '/settings',         icon: Settings,         label: 'Settings'        },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 h-screen bg-[#0D0D0D] border-r border-purple-900/20 flex flex-col fixed left-0 top-0 z-40">

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-purple-900/20">
        <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center glow-sm">
          <Compass size={16} className="text-white" />
        </div>
        <span className="text-white font-semibold text-lg">CareerPilot</span>
        <span className="text-purple-400 font-semibold text-lg">AI</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-all duration-200
                ${active
                  ? 'bg-purple-600/20 text-purple-300 border border-purple-600/30'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`}
            >
              <Icon size={17} className={active ? 'text-purple-400' : ''} />
              {label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-purple-900/20">
        <p className="text-xs text-gray-600 text-center">
  CareerPilot AI
  <br />
  Learn • Grow • Succeed
</p>
      </div>
    </aside>
  )
}
