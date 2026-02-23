import React from 'react'
import { useLocation } from 'react-router-dom'

type Props = {
  onLogout?: () => void
}

const viewLabels: Record<string, string> = {
  '/dashboard':        'Overview',
  '/templates':        'Templates',
  '/stickers':         'Stickers',
  '/templates/editor': 'Editor',
  '/stickers/editor':  'Editor',
}

function getLabel(pathname: string): string {
  if (pathname.startsWith('/templates/editor')) return 'Editor'
  if (pathname.startsWith('/stickers/editor'))  return 'Editor'
  return viewLabels[pathname] ?? pathname.replace('/', '')
}

export default function HeaderBar({ onLogout }: Props) {
  const { pathname } = useLocation()
  return (
    <header className="h-12 bg-white border-b border-stone-200 flex items-center justify-between px-6 shrink-0 z-10">
      <div className="flex items-center gap-1.5 text-sm text-stone-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        </svg>
        <span className="text-stone-400">›</span>
        <span className="text-stone-800 font-medium">{getLabel(pathname)}</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
        </button>
        <button
          onClick={onLogout}
          className="text-xs font-medium text-stone-500 hover:text-stone-900 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </header>
  )
}

