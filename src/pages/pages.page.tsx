import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import { fetchContent, deleteContent, toggleContentPublish } from '../actions/contentAction'
import type { ContentItem } from '../api/types'

function Thumbnail({ page }: { page: { background?: string; elements?: unknown[] } | undefined }) {
  const bg = page?.background ?? '#ffffff'
  const elemCount = page?.elements?.length ?? 0
  const isTransparent = bg === 'transparent'
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: isTransparent ? undefined : bg,
        backgroundImage: isTransparent
          ? 'repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 10px 10px'
          : undefined,
      }}
    >
      {elemCount === 0 ? (
        <div className="text-stone-300 text-xs flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="text-[10px]">Empty</span>
        </div>
      ) : (
        <span className="text-xs font-medium text-stone-500">{elemCount} el</span>
      )}
    </div>
  )
}

export default function PagesPage() {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, loading, deleting, togglingId, error } = useAppSelector(s => s.content)
  const [search, setSearch] = useState('')

  const load = useCallback((q?: string) => {
    dispatch(fetchContent({ itemType: 'page', search: q }))
  }, [dispatch])

  useEffect(() => { void load() }, [load])

  const handleSearch = () => load(search || undefined)

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this page?')) return
    const preserveForUsers = confirm(
      'Allow existing journal owners to keep using this page after deletion?\n\nOK = Allow\nCancel = Delete from everywhere'
    )
    try {
      await dispatch(deleteContent({ id, preserveForUsers })).unwrap()
    } catch {
      alert('Failed to delete')
    }
  }

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      await dispatch(toggleContentPublish({ id: item._id, isPublished: !item.isPublished })).unwrap()
    } catch {
      alert('Failed to update')
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold text-stone-900">Pages</h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Single pages that can be added to journals & templates
          </p>
        </div>
        <button
          onClick={() => navigate('/pages/editor')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-700 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Page
        </button>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1 max-w-sm">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleSearch() }}
            placeholder="Search pages…"
            className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300"
          />
        </div>
        <button
          onClick={handleSearch}
          className="px-3 py-2 text-xs font-medium border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg
            className="animate-spin"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-stone-400 gap-3">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-sm">No pages yet</p>
          <button
            onClick={() => navigate('/pages/editor')}
            className="text-sm text-sky-600 hover:underline"
          >
            Create your first page →
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {items.map(item => (
            <div
              key={item._id}
              className="group bg-white border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer"
              onClick={() => navigate(`/pages/editor/${item._id}`)}
            >
              <div className="aspect-3/4 relative">
                <Thumbnail page={(item.pages as Array<{ background?: string; elements?: unknown[] }>)[0]} />
                {/* Overlay buttons */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleTogglePublish(item)
                    }}
                    disabled={togglingId === item._id}
                    className={`p-1.5 rounded-lg text-xs font-bold shadow-sm transition-colors ${
                      item.isPublished
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                        : 'bg-white text-stone-500 hover:bg-stone-100'
                    }`}
                    title={item.isPublished ? 'Unpublish' : 'Publish'}
                  >
                    {item.isPublished ? '✓' : '○'}
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleDelete(item._id)
                    }}
                    disabled={deleting === item._id}
                    className="p-1.5 rounded-lg bg-white text-rose-500 hover:bg-rose-50 shadow-sm transition-colors"
                    title="Delete"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14H6L5 6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-3 py-2.5">
                <p className="text-xs font-semibold text-stone-800 truncate">{item.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
                      item.isPublished
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-stone-100 text-stone-400'
                    }`}
                  >
                    {item.isPublished ? 'Published' : 'Draft'}
                  </span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
