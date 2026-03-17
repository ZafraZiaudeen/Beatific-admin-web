import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { API_BASE_URL } from '@/constants'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppSelector } from '../api/hooks'
import { mainCategoryApi, categoryApi } from '../api/apiClient'

interface MiniSubcategory { name: string; slug: string }
interface SubCategory {
  _id: string
  name: string
  slug: string
  icon?: string
  color: string
  itemType: string   
  subcategories: MiniSubcategory[]
}
interface MainCategory {
  _id: string
  name: string
  slug: string
  icon?: string
  color: string
  order: number
}

type Props = { onLogout?: () => void }
const COLOR_CLASSES: Record<string, { text: string; hover: string; active: string; badge: string }> = {
  sky:    { text: 'text-sky-700',    hover: 'hover:bg-sky-50',    active: 'bg-sky-50 text-sky-800',    badge: 'bg-sky-100 text-sky-700'    },
  violet: { text: 'text-violet-700', hover: 'hover:bg-violet-50', active: 'bg-violet-50 text-violet-800', badge: 'bg-violet-100 text-violet-700' },
  emerald:{ text: 'text-emerald-700',hover: 'hover:bg-emerald-50',active: 'bg-emerald-50 text-emerald-800',badge: 'bg-emerald-100 text-emerald-700'},
  rose:   { text: 'text-rose-700',   hover: 'hover:bg-rose-50',   active: 'bg-rose-50 text-rose-800',   badge: 'bg-rose-100 text-rose-700'   },
  amber:  { text: 'text-amber-700',  hover: 'hover:bg-amber-50',  active: 'bg-amber-50 text-amber-800', badge: 'bg-amber-100 text-amber-700' },
  stone:  { text: 'text-stone-700',  hover: 'hover:bg-stone-50',  active: 'bg-stone-50 text-stone-900', badge: 'bg-stone-100 text-stone-700' },
  indigo: { text: 'text-indigo-700', hover: 'hover:bg-indigo-50', active: 'bg-indigo-50 text-indigo-800', badge: 'bg-indigo-100 text-indigo-700' },
  teal:   { text: 'text-teal-700',   hover: 'hover:bg-teal-50',   active: 'bg-teal-50 text-teal-800',   badge: 'bg-teal-100 text-teal-700'   },
  orange: { text: 'text-orange-700', hover: 'hover:bg-orange-50', active: 'bg-orange-50 text-orange-800', badge: 'bg-orange-100 text-orange-700' },
  pink:   { text: 'text-pink-700',   hover: 'hover:bg-pink-50',   active: 'bg-pink-50 text-pink-800',   badge: 'bg-pink-100 text-pink-700'   },
}
function cc(color: string) { return COLOR_CLASSES[color] ?? COLOR_CLASSES.stone }

const COLORS = ['sky', 'violet', 'emerald', 'rose', 'amber', 'stone', 'indigo', 'teal', 'orange', 'pink']

function FolderIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="shrink-0">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  )
}

function ManageCategoriesModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [mainCats, setMainCats]           = useState<MainCategory[]>([])
  const [subCats, setSubCats]             = useState<SubCategory[]>([])
  const [loading, setLoading]             = useState(true)
  const [activeMainId, setActiveMainId]   = useState<string>('')

  const [addingMain, setAddingMain]       = useState(false)
  const [newMainName, setNewMainName]     = useState('')
  const [newMainColor, setNewMainColor]   = useState('sky')
  const mainNameInputRef = useRef<HTMLInputElement>(null)

  const [newSubName, setNewSubName]       = useState('')
  const [newSubColor, setNewSubColor]     = useState('stone')

  const [expandedSubId, setExpandedSubId] = useState<string | null>(null)
  const [addingMiniFor, setAddingMiniFor] = useState<string | null>(null)
  const [newMiniName, setNewMiniName]     = useState('')

  const [saving, setSaving]               = useState(false)
  const [error, setError]                 = useState<string | null>(null)
  const [successMsg, setSuccessMsg]       = useState<string | null>(null)

  const showSuccess = (msg: string) => { setSuccessMsg(msg); setError(null); setTimeout(() => setSuccessMsg(null), 2500) }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extractMsg  = (err: any): string => err?.response?.data?.message ?? err?.message ?? String(err)
  const showError   = (msg: string) => { setError(msg); setSuccessMsg(null); setTimeout(() => setError(null), 5000) }

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [mainRes, subRes] = await Promise.all([
        mainCategoryApi.list(),
        categoryApi.list(),
      ])
      const loadedMain = (mainRes.data ?? []) as MainCategory[]
      const loadedSub  = (subRes.data  ?? []) as SubCategory[]
      setMainCats(loadedMain)
      setSubCats(loadedSub)
      setActiveMainId(prev => {
        const ids = loadedMain.map(m => m._id)
        return (prev && ids.includes(prev)) ? prev : (loadedMain[0]?._id ?? '')
      })
    } catch (err) { showError('Failed to load: ' + extractMsg(err)) }
    finally { setLoading(false) }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { void loadAll() }, [loadAll])

  useEffect(() => {
    if (addingMain) {
      const timer = setTimeout(() => mainNameInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [addingMain])

  const activeMain   = mainCats.find(m => m._id === activeMainId)
  const filteredSubs = subCats.filter(s => s.itemType === activeMain?.slug)

  const handleAddMainCategory = async () => {
    if (!newMainName.trim()) return
    const name = newMainName.trim()
    setSaving(true)
    try {
      await mainCategoryApi.create({ name, color: newMainColor })
      setNewMainName(''); setNewMainColor('sky'); setAddingMain(false)
      showSuccess(`"${name}" created!`)
      await loadAll(); onSaved()
    } catch (err) {
      const msg = extractMsg(err)
      showError(msg.includes('duplicate') || msg.includes('11000')
        ? `A main category named "${name}" already exists.`
        : `Failed to create: ${msg}`)
    } finally { setSaving(false) }
  }

  const handleDeleteMainCategory = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?\n\nThis will also delete ALL sub-categories under it.\nContent items will keep their data but lose the category grouping.`)) return
    try {
      await mainCategoryApi.delete(id)
      showSuccess(`"${name}" deleted.`)
      await loadAll(); onSaved()
    } catch (err) { showError(`Failed to delete: ${extractMsg(err)}`) }
  }

  const handleAddSubCategory = async () => {
    if (!newSubName.trim() || !activeMain) return
    const name = newSubName.trim()
    setSaving(true)
    try {
      await categoryApi.create({ name, color: newSubColor, itemType: activeMain.slug })
      setNewSubName(''); setNewSubColor('stone')
      showSuccess(`"${name}" added!`)
      await loadAll(); onSaved()
    } catch (err) {
      const msg = extractMsg(err)
      showError(msg.includes('duplicate') || msg.includes('11000')
        ? `A sub-category named "${name}" already exists under "${activeMain.name}".`
        : `Failed to create sub-category: ${msg}`)
    } finally { setSaving(false) }
  }

  const handleDeleteSubCategory = async (id: string, name: string) => {
    if (!confirm(`Delete sub-category "${name}"?`)) return
    try {
      await categoryApi.delete(id)
      showSuccess(`"${name}" deleted.`)
      await loadAll(); onSaved()
    } catch (err) { showError(`Failed to delete: ${extractMsg(err)}`) }
  }

  const handleAddMini = async (subId: string) => {
    if (!newMiniName.trim()) return
    const name = newMiniName.trim()
    setSaving(true)
    try {
      await categoryApi.addSubcategory(subId, { name })
      showSuccess(`"${name}" added!`)
      setNewMiniName(''); setAddingMiniFor(null)
      await loadAll(); onSaved()
    } catch (err) {
      showError(`Failed to add mini-subcategory: ${extractMsg(err)}`)
    } finally { setSaving(false) }
  }

  const handleRemoveMini = async (subId: string, slug: string, name: string) => {
    try {
      await categoryApi.removeSubcategory(subId, slug)
      showSuccess(`"${name}" removed.`)
      await loadAll(); onSaved()
    } catch (err) { showError(`Failed to remove: ${extractMsg(err)}`) }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[88vh] flex flex-col">

        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-stone-100">
          <div>
            <h2 className="text-sm font-bold text-stone-900">Manage Categories</h2>
            <p className="text-[11px] text-stone-400 mt-0.5">Create and organise main categories, sub-categories, and leaf items.</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-700">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden min-h-0">

          <div className="w-44 border-r border-stone-100 flex flex-col bg-stone-50/50">
            <div className="px-3 pt-3 pb-1 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Main Categories</div>
            <div className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
              {loading ? (
                <div className="text-xs text-stone-400 py-3 text-center">Loading…</div>
              ) : mainCats.length === 0 ? (
                <div className="text-xs text-stone-400 py-3 px-2 text-center">No categories yet.</div>
              ) : mainCats.map(mc => (
                <div key={mc._id} className="group flex items-center gap-1">
                  <button
                    onClick={() => setActiveMainId(mc._id)}
                    className={`flex-1 flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-lg transition-colors text-left ${activeMainId === mc._id ? 'bg-stone-900 text-white' : 'text-stone-600 hover:bg-stone-100'}`}
                  >
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cc(mc.color).badge.split(' ')[0]}`} />
                    <span className="truncate flex-1">{mc.name}</span>
                  </button>
                  <button
                    onClick={() => handleDeleteMainCategory(mc._id, mc.name)}
                    title="Delete main category"
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-50 text-stone-300 hover:text-rose-500 transition-all shrink-0"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                  </button>
                </div>
              ))}
            </div>

            <div className="p-2 border-t border-stone-100">
              {addingMain ? (
                <div className="space-y-1.5">
                  <input
                    ref={mainNameInputRef}
                    value={newMainName}
                    onChange={e => setNewMainName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') void handleAddMainCategory(); if (e.key === 'Escape') { setAddingMain(false); setNewMainName('') } }}
                    placeholder="Category name…"
                    className="w-full text-xs px-2 py-1.5 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300"
                  />
                  <div className="flex gap-0.5 flex-wrap">
                    {COLORS.slice(0, 6).map(c => (
                      <button key={c} onClick={() => setNewMainColor(c)} className={`w-3.5 h-3.5 rounded-full border-2 ${cc(c).badge.split(' ')[0]} ${newMainColor === c ? 'border-stone-700 scale-110' : 'border-transparent'}`} title={c} />
                    ))}
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => void handleAddMainCategory()} disabled={saving || !newMainName.trim()}
                      className="flex-1 py-1 text-[11px] font-bold bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50">
                      {saving ? '…' : 'Add'}
                    </button>
                    <button onClick={() => { setAddingMain(false); setNewMainName('') }}
                      className="px-2 py-1 text-[11px] text-stone-400 hover:text-stone-700">✕</button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setAddingMain(true)}
                  className="w-full flex items-center justify-center gap-1 py-1.5 text-xs font-medium text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg border border-dashed border-stone-300 transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                  New
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 flex flex-col overflow-hidden min-h-0">
            {!activeMain ? (
              <div className="flex-1 flex items-center justify-center text-xs text-stone-400">
                Select or create a main category first.
              </div>
            ) : (
              <>
                <div className="px-4 pt-3 pb-1 flex items-center gap-2">
                  <span className={`w-2.5 h-2.5 rounded-full ${cc(activeMain.color).badge.split(' ')[0]}`} />
                  <span className="text-xs font-bold text-stone-700">{activeMain.name}</span>
                  <span className="text-[10px] text-stone-400">→ sub-categories</span>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-2 space-y-1.5">
                  {loading ? (
                    <div className="text-xs text-stone-400 py-3 text-center">Loading…</div>
                  ) : filteredSubs.length === 0 ? (
                    <div className="text-xs text-stone-400 py-3 text-center">No sub-categories yet. Add one below.</div>
                  ) : filteredSubs.map(sub => (
                    <div key={sub._id} className="border border-stone-200 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-stone-50">
                        <button onClick={() => setExpandedSubId(prev => prev === sub._id ? null : sub._id)} className="p-0.5 text-stone-400 hover:text-stone-700">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                            className={`transition-transform ${expandedSubId === sub._id ? 'rotate-90' : ''}`}>
                            <path d="M9 18l6-6-6-6"/>
                          </svg>
                        </button>
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cc(sub.color).badge.split(' ')[0]}`} />
                        <span className="text-xs font-semibold text-stone-800 flex-1">{sub.name}</span>
                        <span className="text-[10px] text-stone-400">{sub.subcategories.length} leaf</span>
                        <button
                          onClick={() => { setAddingMiniFor(prev => prev === sub._id ? null : sub._id); setNewMiniName('') }}
                          title="Add leaf item" className="p-1 rounded hover:bg-stone-200 text-stone-400 hover:text-stone-700">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                        <button onClick={() => void handleDeleteSubCategory(sub._id, sub.name)} title="Delete sub-category"
                          className="p-1 rounded hover:bg-rose-50 text-stone-400 hover:text-rose-500">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M9 6V4h6v2"/></svg>
                        </button>
                      </div>

                      {expandedSubId === sub._id && (
                        <div className="px-3 pb-2 pt-1 space-y-0.5">
                          {sub.subcategories.map(mini => (
                            <div key={mini.slug} className="flex items-center gap-2 pl-4">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2"><path d="M7 17V7h10"/></svg>
                              <span className="text-xs text-stone-600 flex-1">{mini.name}</span>
                              <button onClick={() => void handleRemoveMini(sub._id, mini.slug, mini.name)} className="p-1 rounded hover:bg-rose-50 text-stone-300 hover:text-rose-400">
                                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6 6 18M6 6l12 12"/></svg>
                              </button>
                            </div>
                          ))}
                          {addingMiniFor === sub._id && (
                            <div className="flex items-center gap-1.5 pl-4 mt-1">
                              <input autoFocus value={newMiniName} onChange={e => setNewMiniName(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') void handleAddMini(sub._id); if (e.key === 'Escape') setAddingMiniFor(null) }}
                                placeholder="Leaf name…"
                                className="flex-1 text-xs px-2 py-1 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300" />
                              <button onClick={() => void handleAddMini(sub._id)} disabled={saving || !newMiniName.trim()}
                                className="px-2 py-1 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50">Add</button>
                              <button onClick={() => setAddingMiniFor(null)} className="text-xs text-stone-400 hover:text-stone-700">✕</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="px-4 py-3 border-t border-stone-100 bg-stone-50/50">
                  {error    && <div className="mb-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">{error}</div>}
                  {successMsg && <div className="mb-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-700">{successMsg}</div>}
                  <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2">Add Sub‑Category to &ldquo;{activeMain?.name}&rdquo;</p>
                  <div className="flex items-center gap-2">
                    <input
                      value={newSubName}
                      onChange={e => setNewSubName(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') void handleAddSubCategory() }}
                      placeholder="Sub-category name…"
                      className="flex-1 text-xs px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 bg-white"
                    />
                    <div className="flex gap-1">
                      {COLORS.slice(0, 6).map(c => (
                        <button key={c} onClick={() => setNewSubColor(c)} className={`w-4 h-4 rounded-full border-2 ${cc(c).badge.split(' ')[0]} ${newSubColor === c ? 'border-stone-700 scale-110' : 'border-transparent'}`} title={c} />
                      ))}
                    </div>
                    <button onClick={() => void handleAddSubCategory()} disabled={saving || !newSubName.trim()}
                      className="px-3 py-2 text-xs font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-700 disabled:opacity-50 shrink-0">
                      {saving ? '…' : 'Add'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="flex justify-end px-6 py-3 border-t border-stone-100">
          <button onClick={onClose} className="px-4 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-lg hover:bg-stone-50">Done</button>
        </div>
      </div>
    </div>
  )
}

function SubCategoryTreeItem({ sub, activeSubSlug, onSelect }: {
  sub: SubCategory
  activeSubSlug: string | null
  onSelect: (subSlug: string, miniSlug?: string) => void
}) {
  const isActive = activeSubSlug === sub.slug
  const [manualOpen, setManualOpen] = useState(false)
  const open = isActive || manualOpen
  const cls = cc(sub.color)

  const toggle = () => {
    if (sub.subcategories.length > 0) setManualOpen(v => !v)
  }

  return (
    <div>
      <button
        onClick={() => { toggle(); onSelect(sub.slug) }}
        className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${isActive ? cls.active : `text-stone-600 ${cls.hover} hover:text-stone-900`}`}
      >
        {sub.subcategories.length > 0 ? (
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
            className={`transition-transform shrink-0 ${open ? 'rotate-90' : ''}`}>
            <path d="M9 18l6-6-6-6"/>
          </svg>
        ) : (
          <span className="w-1.5 h-1.5 rounded-full shrink-0 bg-current opacity-40" />
        )}
        <span className="flex-1 text-left truncate">{sub.name}</span>
      </button>
      {open && sub.subcategories.length > 0 && (
        <div className="ml-3 mt-0.5 space-y-0.5 pl-2 border-l border-stone-100">
          {sub.subcategories.map(mini => (
            <button key={mini.slug} onClick={() => onSelect(sub.slug, mini.slug)}
              className={`w-full text-left px-2.5 py-1.5 text-xs rounded-lg transition-colors text-stone-500 hover:text-stone-800 ${cls.hover}`}>
              {mini.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function NavItem({ label, icon, active, onClick, accentColor = 'stone' }: {
  label: string; icon: React.ReactNode; active: boolean; onClick: () => void; accentColor?: string
}) {
  const activeMap: Record<string, string> = { stone: 'bg-stone-100 text-stone-900', sky: 'bg-sky-50 text-sky-700', violet: 'bg-violet-50 text-violet-700' }
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${active ? (activeMap[accentColor] ?? activeMap.stone) : 'text-stone-500 hover:text-stone-900 hover:bg-stone-50'}`}>
      <span className={active ? '' : 'text-stone-400'}>{icon}</span>
      {label}
    </button>
  )
}

/* ─── Sidebar ──────────────────────────────────────────── */
export default function Sidebar({ onLogout }: Props) {
  const navigate             = useNavigate()
  const { pathname, search } = useLocation()
  const user                 = useAppSelector((s) => s.auth.user)

  const [mainCats,    setMainCats]    = useState<MainCategory[]>([])
  const [subCats,     setSubCats]     = useState<SubCategory[]>([])
  const [showManage,  setShowManage]  = useState(false)
  const [contentOpen, setContentOpen] = useState(true)

  const sp         = new URLSearchParams(search)
  const activeSub  = sp.get('sub')          
  const activeType = sp.get('type') ?? ''  

  const subCatsByMain = useMemo(() => {
    const m: Record<string, SubCategory[]> = {}
    for (const sub of subCats) {
      if (!m[sub.itemType]) m[sub.itemType] = []
      m[sub.itemType].push(sub)
    }
    return m
  }, [subCats])

  const loadAll = useCallback(async () => {
    try {
      const [mainRes, subRes] = await Promise.all([
        mainCategoryApi.list(),
        categoryApi.list(),
      ])
      setMainCats((mainRes.data ?? []) as MainCategory[])
      setSubCats((subRes.data  ?? []) as SubCategory[])
    } catch (err) { console.error('Failed to load sidebar data:', err) }
  }, [])

  useEffect(() => { void loadAll() }, [loadAll])

  const navToContent = (type: string, subSlug?: string, miniSlug?: string) => {
    const q = new URLSearchParams({ type })
    if (subSlug)  q.set('sub',  subSlug)
    if (miniSlug) q.set('mini', miniSlug)
    navigate(`/content?${q.toString()}`)
  }

  const isContentPage = pathname === '/content'

  return (
    <>
      <aside className="w-60 bg-white border-r border-stone-200 flex flex-col flex-shrink-0 z-20">
        {/* Logo */}
        <div className="h-14 flex items-center px-5 border-b border-stone-100">
          <div className="w-7 h-7 bg-gradient-to-br from-stone-800 to-stone-600 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
          </div>
          <div>
            <div className="font-bold text-stone-900 text-sm leading-none">Beatific</div>
            <div className="text-[10px] text-stone-400 font-medium mt-0.5">Admin Panel</div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {/* Overview */}
          <div className="px-2 mb-1.5 mt-1 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Overview</div>
          <NavItem label="Dashboard" active={pathname === '/dashboard'} onClick={() => navigate('/dashboard')}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>}
          />
          <NavItem label="Users" active={pathname === '/users'} onClick={() => navigate('/users')}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>}
          />

          {/* ── Content section ── */}
          <div className="mt-4 mb-1">
            <div className="flex items-center px-2 mb-1.5">
              <span className="flex-1 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Content</span>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowManage(true)} title="Manage categories"
                  className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
                </button>
                <button onClick={() => setContentOpen(o => !o)} className="p-1 rounded hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`transition-transform ${contentOpen ? 'rotate-90' : ''}`}>
                    <path d="M9 18l6-6-6-6"/>
                  </svg>
                </button>
              </div>
            </div>

            {contentOpen && (
              <div className="space-y-0.5">
                {mainCats.length === 0 ? (
                  <p className="px-3 py-2 text-xs text-stone-400">No categories yet. Click ⚙ to add.</p>
                ) : mainCats.map(mainCat => {
                  const subs = subCatsByMain[mainCat.slug] ?? []
                  const isMainActive = isContentPage && activeType === mainCat.slug
                  const cls = cc(mainCat.color)
                  return (
                    <div key={mainCat._id} className="space-y-0.5">
                      <div
                        role="button"
                        tabIndex={0}
                        onClick={() => navToContent(mainCat.slug)}
                        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navToContent(mainCat.slug) }}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${isMainActive && !activeSub ? cls.active : `text-stone-600 hover:bg-stone-50 hover:text-stone-900`}`}
                      >
                        <FolderIcon size={13} />
                        <span className="flex-1 text-left">{mainCat.name}</span>
                        <button
                          onClick={e => { e.stopPropagation(); navigate(`/content/editor?type=${mainCat.slug}`) }}
                          title={`New ${mainCat.name} item`}
                          className="p-0.5 rounded hover:bg-sky-100 text-stone-400 hover:text-sky-700 transition-colors"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                        </button>
                      </div>
                      {subs.length > 0 && (
                        <div className="ml-3 pl-2 border-l border-stone-100 space-y-0.5">
                          {subs.map(sub => (
                            <SubCategoryTreeItem
                              key={sub._id}
                              sub={sub}
                              activeSubSlug={isMainActive ? activeSub : null}
                              onSelect={(subSlug, miniSlug) => navToContent(mainCat.slug, subSlug, miniSlug)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* ── Pages section ── */}
          <div className="px-2 mb-1.5 mt-4 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Pages</div>
          <NavItem
            label="All Pages"
            active={pathname === '/pages'}
            onClick={() => navigate('/pages')}
            accentColor="sky"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
          />
          <NavItem
            label="New Page"
            active={pathname === '/pages/editor' && !window.location.search}
            onClick={() => navigate('/pages/editor')}
            accentColor="sky"
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
          />

          {/* Settings */}
          <div className="px-2 mb-1.5 mt-4 text-[9px] font-bold text-stone-400 uppercase tracking-widest">Settings</div>
          <NavItem label="Permissions" active={pathname === '/permissions'} onClick={() => navigate('/permissions')}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>}
          />
          <NavItem label="Settings" active={pathname === '/settings'} onClick={() => navigate('/settings')}
            icon={<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>}
          />
        </nav>

        {/* User profile */}
        <div className="p-3 border-t border-stone-100">
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-300 to-stone-400 overflow-hidden flex-shrink-0">
              {(() => {
                const avatar = user?.avatar ?? ''
                let src = `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email ?? 'Admin'}`
                try {
                  if (avatar) {
                    if (/^https?:\/\//i.test(avatar)) src = avatar
                    else {
                      const base = new URL(API_BASE_URL).origin
                      src = avatar.startsWith('/') ? `${base}${avatar}` : `${base}/${avatar}`
                    }
                  }
                } catch (err) {
                  // fallback to dicebear
                }
                return (
                  <img
                    src={src}
                    alt={user?.name ?? 'Admin'}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.email ?? 'Admin'}` }}
                  />
                )
              })()}
            </div>
            <div className="text-left flex-1 min-w-0">
              <p className="text-xs font-semibold text-stone-900 truncate">{user?.name ?? 'Admin'}</p>
              <p className="text-[10px] text-stone-400 truncate">{user?.email ?? ''}</p>
            </div>
            <button onClick={onLogout} title="Sign out" className="p-1 rounded hover:bg-stone-100 transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#a8a29e" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
            </button>
          </div>
        </div>
      </aside>

      {showManage && (
        <ManageCategoriesModal onClose={() => setShowManage(false)} onSaved={() => { void loadAll() }} />
      )}
    </>
  )
}
