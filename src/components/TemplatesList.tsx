import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import { fetchTemplates, deleteTemplate, toggleTemplatePublish } from '../actions/templateAction'
import type { TemplateItem } from '../api/types'

type Props = {
  onEdit: (id: string, name: string, pages: any[]) => void
  onNew: () => void
}

function CategoryBadge({ category }: { category?: string }) {
  if (!category) return null
  const colors: Record<string, string> = {
    Productivity: 'bg-blue-50 text-blue-700 border-blue-100',
    Wellness:     'bg-emerald-50 text-emerald-700 border-emerald-100',
    Travel:       'bg-orange-50 text-orange-700 border-orange-100',
    Finance:      'bg-purple-50 text-purple-700 border-purple-100',
    Education:    'bg-yellow-50 text-yellow-700 border-yellow-100',
    Creative:     'bg-pink-50 text-pink-700 border-pink-100',
  }
  const cls = colors[category] ?? 'bg-stone-50 text-stone-600 border-stone-200'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${cls}`}>
      {category}
    </span>
  )
}

function TemplateThumbnail({ pages }: { pages: any[] }) {
  const bg = pages?.[0]?.background ?? '#ffffff'
  const elemCount = pages?.[0]?.elements?.length ?? 0
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{ background: bg }}
    >
      {/* Decorative element previews */}
      {elemCount === 0 && (
        <div className="text-stone-300 text-xs flex flex-col items-center gap-1">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M3 9h18M9 21V9"/>
          </svg>
          <span>Empty</span>
        </div>
      )}
      {elemCount > 0 && (
        <span className="text-xs font-medium text-stone-500">
          {elemCount} element{elemCount !== 1 ? 's' : ''}
        </span>
      )}
      {/* Page count badge */}
      {pages?.length > 1 && (
        <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] px-1 py-0.5 rounded">
          {pages.length}p
        </span>
      )}
    </div>
  )
}

export default function TemplatesList({ onEdit, onNew }: Props) {
  const dispatch = useAppDispatch()
  const { items: templates, loading, deleting, togglingId, error } = useAppSelector(s => s.templates)
  const [search, setSearch] = useState('')
  const [view, setView]     = useState<'grid' | 'list'>('grid')

  const load = useCallback((q?: string) => {
    dispatch(fetchTemplates(q ? { search: q } : undefined))
  }, [dispatch])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template? This cannot be undone.')) return
    try {
      await dispatch(deleteTemplate(id)).unwrap()
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed')
    }
  }

  const handleTogglePublish = async (tmpl: TemplateItem) => {
    try {
      await dispatch(toggleTemplatePublish({ id: tmpl._id, isPublished: !tmpl.isPublished })).unwrap()
    } catch (e: any) {
      alert(e?.message ?? 'Failed to update publish state')
    }
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* ── Header ── */}
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Templates</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {loading ? 'Loading…' : `${templates.length} template${templates.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-md">
            {/* Search */}
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search templates…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-sky-300 focus:border-sky-300 transition-colors"
              />
            </div>
            {/* View toggle */}
            <div className="flex border border-stone-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setView('grid')}
                className={`px-2.5 py-2 text-stone-500 transition-colors ${view === 'grid' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'}`}
                title="Grid view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-2.5 py-2 text-stone-500 transition-colors border-l border-stone-200 ${view === 'list' ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'}`}
                title="List view"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
                </svg>
              </button>
            </div>
          </div>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-700 transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Template
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className={view === 'grid' ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4' : 'space-y-2'}>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-xl h-48" />
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2.5"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-stone-700 mb-1">No templates yet</h3>
            <p className="text-sm text-stone-400 mb-5">Create your first template to get started.</p>
            <button onClick={onNew} className="px-5 py-2 bg-stone-900 text-white text-sm font-medium rounded-lg hover:bg-stone-700 transition-colors">
              Create Template
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {templates.map(tmpl => (
              <div
                key={tmpl._id}
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-md transition-all"
              >
                <div className="h-36 border-b border-stone-100 relative">
                  <TemplateThumbnail pages={tmpl.pages as any[]} />
                  <div className="absolute inset-0 bg-stone-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button
                      onClick={() => onEdit(tmpl._id, tmpl.name, tmpl.pages as any[])}
                      className="px-3 py-1.5 bg-white text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tmpl._id)}
                      disabled={deleting === tmpl._id}
                      className="px-3 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-lg hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                      {deleting === tmpl._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-xs font-semibold text-stone-900 truncate mb-1" title={tmpl.name}>
                    {tmpl.name}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    <CategoryBadge category={tmpl.category} />
                    <button
                      onClick={() => handleTogglePublish(tmpl)}
                      disabled={togglingId === tmpl._id}
                      title={tmpl.isPublished ? 'Click to unpublish' : 'Click to publish'}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-colors disabled:opacity-50 ${
                        tmpl.isPublished
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                          : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {togglingId === tmpl._id ? '…' : (tmpl.isPublished ? 'Published' : 'Draft')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={onNew}
              className="h-[172px] flex flex-col items-center justify-center gap-2 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
              </svg>
              <span className="text-xs font-medium">New Template</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Template</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Pages</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {templates.map(tmpl => (
                  <tr key={tmpl._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-10 rounded border border-stone-200 flex-shrink-0 overflow-hidden"
                          style={{ background: (tmpl.pages as any[])?.[0]?.background ?? '#fff' }}
                        />
                        <div>
                          <p className="font-medium text-stone-900">{tmpl.name}</p>
                          {tmpl.description && (
                            <p className="text-xs text-stone-400 truncate max-w-xs">{tmpl.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3"><CategoryBadge category={tmpl.category} /></td>
                    <td className="px-5 py-3 text-stone-500 text-xs">{tmpl.pages?.length ?? 0}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => handleTogglePublish(tmpl)}
                        disabled={togglingId === tmpl._id}
                        className={`text-[10px] font-medium px-2 py-1 rounded-full border transition-colors disabled:opacity-50 ${
                          tmpl.isPublished
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100'
                            : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {togglingId === tmpl._id ? '…' : (tmpl.isPublished ? 'Published' : 'Draft')}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => onEdit(tmpl._id, tmpl.name, tmpl.pages as any[])}
                          className="text-xs font-medium text-sky-600 hover:text-sky-800 px-2 py-1 rounded hover:bg-sky-50 transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(tmpl._id)}
                          disabled={deleting === tmpl._id}
                          className="text-xs font-medium text-rose-500 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 transition-colors disabled:opacity-50"
                        >
                          {deleting === tmpl._id ? '…' : 'Delete'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
