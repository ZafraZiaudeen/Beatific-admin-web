import React from 'react'

type Props = {
  onNewContent: () => void
  onViewContent: () => void
}

export default function Dashboard({ onNewContent, onViewContent }: Props) {
  return (
    <div id="subview-dashboard" className="flex-1 overflow-y-auto p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-stone-900 tracking-tight mb-1">Overview</h1>
            <p className="text-sm text-stone-500">Welcome back! Here&apos;s what&apos;s happening today.</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onNewContent} className="px-4 py-2 bg-stone-900 text-white text-xs font-medium rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
              New Item
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+12%</span>
            </div>
            <h3 className="text-2xl font-semibold text-stone-900">–</h3>
            <p className="text-xs text-stone-500 mt-1">Total Active Users</p>
          </div>

          <button onClick={onViewContent} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm text-left hover:border-sky-300 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">+5%</span>
            </div>
            <h3 className="text-2xl font-semibold text-stone-900 group-hover:text-sky-700 transition-colors">Content</h3>
            <p className="text-xs text-stone-500 mt-1">Click to manage →</p>
          </button>

          <button onClick={onNewContent} className="bg-white p-5 rounded-xl border border-stone-200 shadow-sm text-left hover:border-violet-300 hover:shadow-md transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="w-10 h-10 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>
              </div>
              <span className="text-xs font-medium text-stone-400 bg-stone-50 px-2 py-0.5 rounded-full">New</span>
            </div>
            <h3 className="text-2xl font-semibold text-stone-900 group-hover:text-violet-700 transition-colors">Create</h3>
            <p className="text-xs text-stone-500 mt-1">Start something new →</p>
          </button>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-stone-900">Quick Actions</h3>
          </div>
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              onClick={onNewContent}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-200 hover:border-sky-300 hover:bg-sky-50 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 group-hover:bg-sky-100 flex items-center justify-center transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg>
              </div>
              <span className="text-xs font-medium text-stone-700">New Item</span>
            </button>
            <button
              onClick={onViewContent}
              className="flex flex-col items-center gap-2 p-4 rounded-xl border border-stone-200 hover:border-stone-400 hover:bg-stone-50 transition-all"
            >
              <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
              </div>
              <span className="text-xs font-medium text-stone-700">All Content</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
