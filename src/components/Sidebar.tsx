import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../api/hooks'

type Props = {
  onLogout?: () => void
}

function NavItem({
  label,
  icon,
  active,
  onClick,
  accentColor = 'stone',
}: {
  label: string
  icon: React.ReactNode
  active: boolean
  onClick: () => void
  accentColor?: 'stone' | 'sky' | 'violet'
}) {
  const activeClasses = {
    stone:  'bg-stone-100 text-stone-900',
    sky:    'bg-sky-50 text-sky-700',
    violet: 'bg-violet-50 text-violet-700',
  }
  const inactiveClass = 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
        active ? activeClasses[accentColor] : inactiveClass
      }`}
    >
      <span className={active ? '' : 'text-stone-400'}>{icon}</span>
      {label}
    </button>
  )
}

export default function Sidebar({ onLogout }: Props) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = useAppSelector((s) => s.auth.user)
  return (
    <aside className="w-60 bg-white border-r border-stone-200 flex flex-col flex-shrink-0 z-20">
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-stone-100">
        <div className="w-7 h-7 bg-gradient-to-br from-stone-800 to-stone-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
          </svg>
        </div>
        <div>
          <div className="font-bold text-stone-900 text-sm leading-none">Beatific</div>
          <div className="text-[10px] text-stone-400 font-medium mt-0.5">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <div className="px-2 mb-1.5 mt-1 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
          Overview
        </div>

        <NavItem
          label="Dashboard"
          active={pathname === '/dashboard'}
          onClick={() => navigate('/dashboard')}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
              <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
            </svg>
          }
        />

        <NavItem
          label="Users"
          active={false}
          onClick={() => {}}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />

        {/* Content section */}
        <div className="px-2 mb-1.5 mt-4 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
          Content
        </div>

        <NavItem
          label="Templates"
          active={pathname.startsWith('/templates')}
          onClick={() => navigate('/templates')}
          accentColor="sky"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/>
              <path d="M3 9h18M9 21V9"/>
            </svg>
          }
        />

        <NavItem
          label="Stickers"
          active={pathname.startsWith('/stickers')}
          onClick={() => navigate('/stickers')}
          accentColor="violet"
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z"/>
              <circle cx="12" cy="12" r="4"/>
              <path d="M12 8v1M12 15v1M8 12h1M15 12h1"/>
            </svg>
          }
        />

        {/* Settings section */}
        <div className="px-2 mb-1.5 mt-4 text-[9px] font-bold text-stone-400 uppercase tracking-widest">
          Settings
        </div>

        <NavItem
          label="Settings"
          active={false}
          onClick={() => {}}
          icon={
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          }
        />
      </nav>

      {/* User profile */}
      <div className="p-3 border-t border-stone-100">
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 overflow-hidden flex-shrink-0">
            <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email ?? 'Admin'}`} alt="Admin" className="w-full h-full object-cover" />
          </div>
          <div className="text-left flex-1 min-w-0">
            <p className="text-xs font-semibold text-stone-900 truncate">{user?.name ?? 'Admin'}</p>
            <p className="text-[10px] text-stone-400 truncate">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={onLogout}
            title="Sign out"
            className="p-1 rounded hover:bg-stone-100 transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </div>
    </aside>
  )
}

