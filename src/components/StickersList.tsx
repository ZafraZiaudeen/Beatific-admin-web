import { useCallback, useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '../api/hooks'
import { fetchStickers, deleteSticker, toggleStickerPublish } from '../actions/stickerAction'
import type { StickerItem } from '../api/types'

type Props = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onEdit: (id: string, name: string, pages: any[]) => void
  onNew: () => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function StickerThumbnail({ pages }: { pages: any[] }) {
  const bg = pages?.[0]?.background ?? '#ffffff'
  const elemCount = pages?.[0]?.elements?.length ?? 0
  return (
    <div
      className="w-full h-full flex items-center justify-center relative"
      style={{
        background: bg === 'transparent' ? undefined : bg,
        backgroundImage: bg === 'transparent'
          ? 'repeating-conic-gradient(#e5e5e5 0% 25%, #f5f5f5 0% 50%) 0 0 / 10px 10px'
          : undefined,
      }}
    >
      {elemCount === 0 && (
        <div className="text-stone-300 text-xs flex flex-col items-center gap-1">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
            <path d="M8 12h8M12 8v8"/>
          </svg>
          <span>Empty</span>
        </div>
      )}
      {elemCount > 0 && (
        <span className="text-xs font-medium text-stone-500">{elemCount} el</span>
      )}
    </div>
  )
}

export default function StickersList({ onEdit, onNew }: Props) {
  const dispatch = useAppDispatch()
  const { items: stickers, loading, deleting, togglingId, error } = useAppSelector(s => s.stickers)
  const [search, setSearch] = useState('')

  const load = useCallback((q?: string) => {
    dispatch(fetchStickers(q ? { search: q } : undefined))
  }, [dispatch])

  useEffect(() => { load() }, [load])

  useEffect(() => {
    const t = setTimeout(() => load(search || undefined), 300)
    return () => clearTimeout(t)
  }, [search, load])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sticker? This cannot be undone.')) return
    try {
      await dispatch(deleteSticker(id)).unwrap()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      alert(e?.message ?? 'Delete failed')
    }
  }

  const handleTogglePublish = async (sticker: StickerItem) => {
    try {
      await dispatch(toggleStickerPublish({ id: sticker._id, isPublished: !sticker.isPublished })).unwrap()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
            <h1 className="text-xl font-semibold text-stone-900 tracking-tight">Stickers</h1>
            <p className="text-xs text-stone-400 mt-0.5">
              {loading ? 'Loading…' : `${stickers.length} sticker${stickers.length !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
              </svg>
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search stickers…"
                className="w-full pl-9 pr-3 py-2 text-sm border border-stone-200 rounded-lg bg-stone-50 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-violet-300 transition-colors"
              />
            </div>
          </div>
          <button
            onClick={onNew}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M12 5v14M5 12h14"/>
            </svg>
            New Sticker
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-6xl mx-auto px-8 py-6">
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700 flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="animate-pulse bg-stone-100 rounded-xl aspect-square" />
            ))}
          </div>
        ) : stickers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/>
                <path d="M12 8v8M8 12h8"/>
              </svg>
            </div>
            <h3 className="text-base font-semibold text-stone-700 mb-1">No stickers yet</h3>
            <p className="text-sm text-stone-400 mb-5">Design your first sticker to get started.</p>
            <button onClick={onNew} className="px-5 py-2 bg-violet-600 text-white text-sm font-medium rounded-lg hover:bg-violet-700 transition-colors">
              Create Sticker
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
            {stickers.map(sticker => (
              <div
                key={sticker._id}
                className="group bg-white rounded-xl border border-stone-200 overflow-hidden hover:border-stone-300 hover:shadow-md transition-all aspect-square relative"
              >
                {/* Thumbnail */}
                <div className="w-full h-full">
                  <StickerThumbnail pages={sticker.pages as any[]} />
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-stone-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-[10px] font-medium text-center line-clamp-2 leading-tight">{sticker.name}</p>
                  <button
                    onClick={() => onEdit(sticker._id, sticker.name, sticker.pages as any[])}
                    className="w-full px-2 py-1.5 bg-white text-stone-900 text-[11px] font-semibold rounded-lg hover:bg-stone-100 transition-colors"
                  >
                    Edit
                  </button>
                  <div className="flex gap-1.5 w-full">
                    <button
                      onClick={() => handleTogglePublish(sticker)}
                      disabled={togglingId === sticker._id}
                      className={`flex-1 py-1 text-[10px] font-medium rounded-md transition-colors disabled:opacity-50 ${
                        sticker.isPublished
                          ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                          : 'bg-stone-600 text-white hover:bg-stone-500'
                      }`}
                    >
                      {togglingId === sticker._id ? '…' : (sticker.isPublished ? '✓ Pub' : 'Draft')}
                    </button>
                    <button
                      onClick={() => handleDelete(sticker._id)}
                      disabled={deleting === sticker._id}
                      className="flex-1 py-1 text-[10px] font-medium bg-rose-500 text-white rounded-md hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                      {deleting === sticker._id ? '…' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {/* Add new sticker */}
            <button
              onClick={onNew}
              className="aspect-square flex flex-col items-center justify-center gap-1.5 bg-violet-50 border-2 border-dashed border-violet-200 rounded-xl text-violet-400 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-100 transition-all"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v8M8 12h8"/>
              </svg>
              <span className="text-[10px] font-medium">New</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
