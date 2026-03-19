import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import { fetchContent, deleteContent, toggleContentPublish } from '../actions/contentAction'
import DeleteWithPreserveModal from '../components/DeleteWithPreserveModal'
import type { ContentItem } from '../api/types'

function Thumbnail({ pages, itemType }: { pages: object[]; itemType: string }) {
  const firstPage = (pages as Array<{ background?: string; elements?: unknown[] }>)?.[0]
  const bg        = firstPage?.background ?? '#ffffff'
  const elemCount = firstPage?.elements?.length ?? 0
  const isTransparent = bg === 'transparent'
  return (
    <div
      className="w-full h-full flex items-center justify-center relative overflow-hidden"
      style={{
        background: isTransparent ? undefined : bg,
        backgroundImage: isTransparent ? 'repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 10px 10px' : undefined,
      }}
    >
      {elemCount === 0 ? (
        <div className="text-stone-300 text-xs flex flex-col items-center gap-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
          </svg>
          <span className="capitalize text-[10px]">{itemType}</span>
        </div>
      ) : (
        <span className="text-xs font-medium text-stone-500">{elemCount} el</span>
      )}
      {(pages?.length ?? 0) > 1 && (
        <span className="absolute bottom-1 right-1 bg-black/40 text-white text-[9px] px-1 py-0.5 rounded">{pages.length}p</span>
      )}
    </div>
  )
}

function Breadcrumb({ category, subcategory }: { category?: string; subcategory?: string }) {
  if (!category) return null
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-stone-500 bg-stone-50 border border-stone-100 px-2 py-0.5 rounded-full truncate max-w-full">
      {category}
      {subcategory && (
        <>
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          {subcategory}
        </>
      )}
    </span>
  )
}

function typeLabel(type: string): string {
  const formatted = type
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
  return formatted.endsWith('s') ? formatted : formatted + 's'
}

export default function ContentPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const type    = searchParams.get('type') ?? ''
  const subSlug = searchParams.get('sub')  ?? undefined
  const mini    = searchParams.get('mini') ?? undefined

  const { items, loading, deleting, togglingId, error } = useAppSelector(s => s.content)
  const dispatch = useAppDispatch()

  const [search,     setSearch]     = useState('')
  const [view,       setView]       = useState<'grid' | 'list'>('grid')
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const load = useCallback((q?: string) => {
    dispatch(fetchContent({
      itemType:    type || undefined,
      search:      q,
      category:    subSlug,
      subcategory: mini,
    }))
  }, [dispatch, type, subSlug, mini])

  useEffect(() => { void load() }, [load])
  useEffect(() => {
    const t = setTimeout(() => void load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const handleDelete = (item: ContentItem) => {
    setDeleteError(null)
    setConfirmDelete({ id: item._id, name: item.name })
  }

  const confirmDeleteAction = async (preserveForUsers: boolean) => {
    if (!confirmDelete) return
    setDeleteError(null)
    try {
      await dispatch(deleteContent({ id: confirmDelete.id, preserveForUsers })).unwrap()
      setConfirmDelete(null)
    } catch (e: any) {
      setDeleteError(e?.message || 'Delete failed')
    }
  }

  const handleTogglePublish = async (item: ContentItem) => {
    try {
      await dispatch(toggleContentPublish({ id: item._id, isPublished: !item.isPublished })).unwrap()
    } catch (e: any) { alert(e?.message || 'Failed') }
  }

  const newItemPath = `/content/editor${type ? `?type=${type}` : ''}`

  const title = mini
    ? `${subSlug} / ${mini}`
    : subSlug
      ? `${type} / ${subSlug}`
      : typeLabel(type || 'All Content')

  const ringClass = 'focus:ring-stone-300'
  const btnBgClass = 'bg-stone-900 hover:bg-stone-700'

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-stone-200 px-8 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-semibold text-stone-900 tracking-tight capitalize">{title}</h1>
              {type && (
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-stone-100 text-stone-700 capitalize">
                  {type}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 mt-0.5">
              {loading ? 'Loading…' : `${items.length} item${items.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={`Search${type ? ` ${type}s` : ''}…`}
                className={`w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 ${ringClass} focus:border-transparent transition-colors`}
              />
            </div>
            <div className="flex border border-stone-200 rounded-lg overflow-hidden">
              {(['grid', 'list'] as const).map(v => (
                <button key={v} onClick={() => setView(v)} title={`${v} view`}
                  className={`px-2.5 py-2 text-stone-500 transition-colors ${v === 'list' ? 'border-l border-stone-200' : ''} ${view === v ? 'bg-stone-900 text-white' : 'hover:bg-stone-50'}`}>
                  {v === 'grid' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>
                  )}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate(newItemPath)}
            className={`flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-colors shrink-0 ${btnBgClass}`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
            New {type ? typeLabel(type).replace(/s$/, '') : 'Item'}
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
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="1.5"><path d="M12 8v8M8 12h8"/><circle cx="12" cy="12" r="10"/></svg>
            </div>
            <h3 className="text-base font-semibold text-stone-700 mb-1">
              No items{subSlug ? ` in "${subSlug}${mini ? ` > ${mini}` : ''}"` : type ? ` in ${typeLabel(type)}` : ''} yet
            </h3>
            <p className="text-sm text-stone-400 mb-5">Create your first one to get started.</p>
            <button onClick={() => navigate(newItemPath)} className={`px-5 py-2 text-white text-sm font-medium rounded-lg ${btnBgClass}`}>
              Create {type ? typeLabel(type).replace(/s$/, '') : 'Item'}
            </button>
          </div>
        ) : view === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {items.map(item => (
              <div key={item._id} className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-md transition-all">
                <div className="h-36 border-b border-stone-100 relative">
                  <Thumbnail pages={item.pages} itemType={item.itemType} />
                  <div className="absolute inset-0 bg-stone-900/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <button onClick={() => navigate(`/content/editor/${item._id}`)} className="px-3 py-1.5 bg-white text-stone-900 text-xs font-semibold rounded-lg hover:bg-stone-100">Edit</button>
                    <button onClick={() => void handleDelete(item)} disabled={deleting === item._id} className="px-3 py-1.5 bg-rose-500 text-white text-xs font-semibold rounded-lg hover:bg-rose-600 disabled:opacity-50">
                      {deleting === item._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
                <div className="p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-stone-900 truncate" title={item.name}>{item.name}</p>
                  <div className="flex items-center justify-between gap-1 flex-wrap">
                    <Breadcrumb category={item.category} subcategory={item.subcategory} />
                    <button
                      onClick={() => void handleTogglePublish(item)}
                      disabled={togglingId === item._id}
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border transition-colors disabled:opacity-50 shrink-0 ${
                        item.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {togglingId === item._id ? '…' : (item.isPublished ? 'Published' : 'Draft')}
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {/* Add new card */}
            <button
              onClick={() => navigate(newItemPath)}
              className="h-[172px] flex flex-col items-center justify-center gap-2 bg-stone-50 border-2 border-dashed border-stone-200 rounded-xl text-stone-400 hover:border-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-all"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/></svg>
              <span className="text-xs font-medium">New</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Name</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Type</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Category</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Pages</th>
                  <th className="px-5 py-3 text-left text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-3 text-right text-[11px] font-semibold text-stone-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {items.map(item => (
                  <tr key={item._id} className="hover:bg-stone-50/50 transition-colors group">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-10 rounded border border-stone-200 flex-shrink-0 overflow-hidden" style={{ background: '#fff' }} />
                        <div>
                          <p className="font-medium text-stone-900">{item.name}</p>
                          {item.description && <p className="text-xs text-stone-400 truncate max-w-xs">{item.description}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-stone-100 text-stone-600 capitalize">{item.itemType}</span>
                    </td>
                    <td className="px-5 py-3"><Breadcrumb category={item.category} subcategory={item.subcategory} /></td>
                    <td className="px-5 py-3 text-stone-500 text-xs">{item.pages?.length ?? 0}</td>
                    <td className="px-5 py-3">
                      <button onClick={() => void handleTogglePublish(item)} disabled={togglingId === item._id}
                        className={`text-[10px] font-medium px-2 py-1 rounded-full border disabled:opacity-50 ${item.isPublished ? 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100' : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'}`}>
                        {togglingId === item._id ? '…' : (item.isPublished ? 'Published' : 'Draft')}
                      </button>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => navigate(`/content/editor/${item._id}`)} className="text-xs font-medium text-sky-600 hover:text-sky-800 px-2 py-1 rounded hover:bg-sky-50">Edit</button>
                        <button onClick={() => void handleDelete(item)} disabled={deleting === item._id} className="text-xs font-medium text-rose-500 hover:text-rose-700 px-2 py-1 rounded hover:bg-rose-50 disabled:opacity-50">
                          {deleting === item._id ? '…' : 'Delete'}
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
      {confirmDelete && (
        <DeleteWithPreserveModal
          title="Delete Item"
          description={`You are about to permanently delete "${confirmDelete.name}".`}
          onClose={() => setConfirmDelete(null)}
          onPreserve={() => void confirmDeleteAction(true)}
          onDeleteEverywhere={() => void confirmDeleteAction(false)}
          deleting={deleting === confirmDelete.id}
          error={deleteError}
        />
      )}
    </div>
  )
}

