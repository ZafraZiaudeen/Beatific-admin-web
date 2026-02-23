import React from 'react'
import { useEditor } from '../../context/useEditor'
import type { Tool } from '../../types/editor'

const icons: Record<string, React.ReactNode> = {
  select: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  ),
  rect: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
    </svg>
  ),
  circle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="12" rx="10" ry="10" />
    </svg>
  ),
  triangle: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 2 21h20z" />
    </svg>
  ),
  star: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  ),
  hexagon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    </svg>
  ),
  pentagon: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2 3 8.5l3.44 10.56h11.12L21 8.5z" />
    </svg>
  ),
  diamond: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="6" y="6" width="12" height="12" rx="1" transform="rotate(45 12 12)" />
    </svg>
  ),
  line: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="4" y1="20" x2="20" y2="4" />
    </svg>
  ),
  arrow: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  ),
  text: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 7V4h16v3M9 20h6M12 4v16" />
    </svg>
  ),
  pen: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  ),
  image: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  ),
}

interface ToolSection {
  label: string
  tools: { id: Tool; label: string; shortcut?: string }[]
}

const TOOL_SECTIONS: ToolSection[] = [
  {
    label: 'Select',
    tools: [
      { id: 'select', label: 'Select', shortcut: 'V' },
    ],
  },
  {
    label: 'Shape',
    tools: [
      { id: 'rect',     label: 'Rect',     shortcut: 'R' },
      { id: 'circle',   label: 'Ellipse',  shortcut: 'E' },
      { id: 'triangle', label: 'Triangle' },
      { id: 'star',     label: 'Star' },
      { id: 'hexagon',  label: 'Hexagon' },
      { id: 'pentagon', label: 'Pentagon' },
      { id: 'diamond',  label: 'Diamond' },
    ],
  },
  {
    label: 'Lines',
    tools: [
      { id: 'line',  label: 'Line',  shortcut: 'L' },
      { id: 'arrow', label: 'Arrow' },
    ],
  },
  {
    label: 'Text',
    tools: [
      { id: 'text', label: 'Text', shortcut: 'T' },
    ],
  },
  {
    label: 'Draw',
    tools: [
      { id: 'pen', label: 'Draw', shortcut: 'P' },
    ],
  },
  {
    label: 'Media',
    tools: [
      { id: 'image', label: 'Image', shortcut: 'I' },
    ],
  },
]

export default function EditorToolbar() {
  const { state, setTool } = useEditor()
  const { activeTool } = state

  return (
    <div className="w-[72px] bg-white border-r border-stone-100 flex flex-col py-3 z-10 overflow-y-auto shrink-0 shadow-sm">
      {TOOL_SECTIONS.map((section, si) => (
        <div key={section.label} className={si > 0 ? 'mt-0.5' : ''}>
          {si > 0 && (
            <div className="flex items-center gap-1 px-3 my-1.5">
              <div className="flex-1 h-px bg-stone-100" />
            </div>
          )}

          <div className="px-2 mb-0.5">
            <span className="block text-center text-[9px] font-semibold text-stone-300 uppercase tracking-widest select-none leading-none">
              {section.label}
            </span>
          </div>

          {section.tools.map(tool => {
            const isActive = activeTool === tool.id
            return (
              <div key={tool.id} className="px-1.5 py-0.5">
                <button
                  onClick={() => setTool(tool.id)}
                  title={`${tool.label}${tool.shortcut ? ` (${tool.shortcut})` : ''}`}
                  className={`
                    relative w-full rounded-xl flex flex-col items-center justify-center gap-0.5
                    py-1.5 px-1 transition-all duration-150 group
                    ${isActive
                      ? 'bg-sky-500 text-white shadow-md shadow-sky-200'
                      : 'text-stone-400 hover:text-stone-700 hover:bg-stone-50'
                    }
                  `}
                >
                  {isActive && (
                    <span className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-sky-500 rounded-r-full" />
                  )}

                  <span className={`transition-transform duration-150 ${isActive ? 'scale-110' : 'group-hover:scale-105'}`}>
                    {icons[tool.id]}
                  </span>
                  <span className={`text-[9px] font-medium leading-none tracking-tight ${isActive ? 'text-white/90' : 'text-stone-400 group-hover:text-stone-600'}`}>
                    {tool.label}
                  </span>
                </button>
              </div>
            )
          })}
        </div>
      ))}

      <div className="flex-1" />
    </div>
  )
}
