import React, { useCallback, useEffect, useState } from 'react'
import { mainCategoryApi, categoryApi, permissionApi, contentApi } from '../api/apiClient'

interface MainCategory {
  _id: string; name: string; slug: string; color: string; order: number
}
interface SubCategory {
  _id: string; name: string; slug: string; color: string; itemType: string; order: number
}
interface ContentItem {
  _id: string; name: string; itemType: string; category: string; coverImageUrl?: string; isPublished: boolean
}
interface Permission {
  _id?: string; scope: string; targetType: string; enabled: boolean
  placementRole?: 'primary' | 'secondary' | null; allowedCategories?: string[]; allowedItems?: string[]
}

const SCOPES = [
  { id: 'home-section', label: 'Home Section Visibility', desc: 'Controls which main categories and their sub-categories appear on the user app home screen.' },
  { id: 'canvas-add', label: 'Canvas "Add" Buttons', desc: 'Controls which item types appear when user clicks "Add Sticker" etc. on the canvas.' },
  { id: 'studio-placement', label: 'Studio Item Placement', desc: 'Controls whether items of this type can be placed into primary containers (templates/journals).' },
]

const ROLES: { value: string | null; label: string; desc: string }[] = [
  { value: null, label: 'None', desc: 'No placement role' },
  { value: 'primary', label: 'Primary', desc: 'Container: items placed INTO this (e.g. Template, Journal)' },
  { value: 'secondary', label: 'Secondary', desc: 'Placed ONTO a primary (e.g. Sticker, Washi-Tape)' },
]

export default function PermissionSettings() {
  const [mainCats, setMainCats] = useState<MainCategory[]>([])
  const [catsByType, setCatsByType] = useState<Record<string, SubCategory[]>>({})
  const [itemsByCat, setItemsByCat] = useState<Record<string, ContentItem[]>>({})
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadAll = useCallback(async () => {
    setLoading(true)
    try {
      const [mcRes, permRes] = await Promise.all([mainCategoryApi.list(), permissionApi.list()])
      const mcs = (mcRes.data ?? []) as MainCategory[]
      setMainCats(mcs)

      const existingPerms = (permRes.data ?? []) as Permission[]

      // Ensure every scope+targetType combo has a permission entry in state
      // so that Save always persists all entries (including new scopes like home-section)
      const permsMap = new Map<string, Permission>()
      for (const p of existingPerms) permsMap.set(`${p.scope}::${p.targetType}`, p)
      for (const scope of SCOPES) {
        for (const mc of mcs) {
          const key = `${scope.id}::${mc.slug}`
          if (!permsMap.has(key)) {
            permsMap.set(key, { scope: scope.id, targetType: mc.slug, enabled: false, placementRole: null, allowedCategories: [], allowedItems: [] })
          }
        }
      }
      setPermissions([...permsMap.values()])

      const catMap: Record<string, SubCategory[]> = {}
      await Promise.all(mcs.map(async mc => {
        const catRes = await categoryApi.list(mc.slug)
        catMap[mc.slug] = (catRes.data ?? []) as SubCategory[]
      }))
      setCatsByType(catMap)

      const itemMap: Record<string, ContentItem[]> = {}
      for (const mc of mcs) {
        for (const cat of (catMap[mc.slug] ?? [])) {
          const key = `${mc.slug}::${cat.slug}`
          const res = await contentApi.list({ itemType: mc.slug, category: cat.slug })
          itemMap[key] = ((res.data ?? []) as ContentItem[]).filter(i => i.isPublished)
        }
      }
      setItemsByCat(itemMap)
    } catch (e: any) { setError(e.message ?? 'Failed to load') }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { void loadAll() }, [loadAll])

  const getPerm = (scope: string, targetType: string): Permission =>
    permissions.find(p => p.scope === scope && p.targetType === targetType) ?? { scope, targetType, enabled: false, placementRole: null, allowedCategories: [] }

  const updateLocal = (scope: string, targetType: string, changes: Partial<Permission>) => {
    setPermissions(prev => {
      const idx = prev.findIndex(p => p.scope === scope && p.targetType === targetType)
      if (idx >= 0) { const u = [...prev]; u[idx] = { ...u[idx], ...changes }; return u }
      return [...prev, { scope, targetType, enabled: true, placementRole: null, allowedCategories: [], allowedItems: [], ...changes }]
    })
    setSaved(false)
  }

  const toggleCategory = (scope: string, targetType: string, catSlug: string) => {
    const perm = getPerm(scope, targetType)
    const current = perm.allowedCategories ?? []
    const next = current.includes(catSlug) ? current.filter(c => c !== catSlug) : [...current, catSlug]
    updateLocal(scope, targetType, { allowedCategories: next })
  }

  const toggleItem = (scope: string, targetType: string, itemId: string) => {
    const perm = getPerm(scope, targetType)
    const current = perm.allowedItems ?? []
    const next = current.includes(itemId) ? current.filter(i => i !== itemId) : [...current, itemId]
    updateLocal(scope, targetType, { allowedItems: next })
  }

  const handleSave = async () => {
    setSaving(true); setError(null)
    try {
      await permissionApi.bulkUpsert(permissions.map(p => ({ scope: p.scope, targetType: p.targetType, enabled: p.enabled, placementRole: p.placementRole || null, allowedCategories: p.allowedCategories ?? [], allowedItems: p.allowedItems ?? [] })))
      setSaved(true); setTimeout(() => setSaved(false), 3000)
    } catch (e: any) { setError(e.message ?? 'Save failed') }
    finally { setSaving(false) }
  }

  if (loading) return <div className="flex-1 flex items-center justify-center text-stone-400 text-sm">Loading…</div>

  return (
    <div className="flex-1 overflow-auto">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-xl font-bold text-stone-900">Permission Settings</h1>
          <p className="text-sm text-stone-500 mt-1">Control which content types are accessible in the user app — home screen visibility, canvas operations, and studio placement.</p>
        </div>
        {error && <div className="mb-4 px-4 py-3 bg-rose-50 border border-rose-200 rounded-xl text-sm text-rose-700">{error}</div>}
        {SCOPES.map(scope => (
          <div key={scope.id} className="mb-8">
            <div className="mb-3">
              <h2 className="text-sm font-bold text-stone-800">{scope.label}</h2>
              <p className="text-xs text-stone-400 mt-0.5">{scope.desc}</p>
            </div>
            <div className="bg-white border border-stone-200 rounded-2xl overflow-hidden divide-y divide-stone-100">
              {mainCats.length === 0 ? (
                <div className="px-5 py-6 text-center text-sm text-stone-400">No main categories — create some via ⚙ first.</div>
              ) : mainCats.map(mc => {
                const perm = getPerm(scope.id, mc.slug)
                return (
                  <div key={mc.slug} className="px-5 py-4">
                    <div className="flex items-center gap-4">
                      <div className="flex-1 min-w-0"><span className="font-semibold text-sm text-stone-800">{mc.name}</span><span className="ml-2 text-[10px] text-stone-400 font-mono">{mc.slug}</span></div>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-stone-500">{perm.enabled ? 'Enabled' : 'Disabled'}</span>
                        <button onClick={() => updateLocal(scope.id, mc.slug, { enabled: !perm.enabled })} className={`w-10 h-6 rounded-full transition-colors relative ${perm.enabled ? 'bg-emerald-500' : 'bg-stone-300'}`}>
                          <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${perm.enabled ? 'left-5' : 'left-1'}`} />
                        </button>
                      </label>
                    </div>
                    {scope.id === 'home-section' && perm.enabled && (catsByType[mc.slug] ?? []).length > 0 && (
                      <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-stone-500 font-medium">Allowed categories on home:</span>
                          <button
                            onClick={() => {
                              const cats = catsByType[mc.slug] ?? []
                              const allSelected = cats.every(c => (perm.allowedCategories ?? []).includes(c.slug))
                              updateLocal(scope.id, mc.slug, { allowedCategories: allSelected ? [] : cats.map(c => c.slug) })
                            }}
                            className="text-[10px] text-stone-400 hover:text-stone-600 font-medium"
                          >
                            {(catsByType[mc.slug] ?? []).every(c => (perm.allowedCategories ?? []).includes(c.slug)) ? 'Deselect All' : 'Select All'}
                          </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {(catsByType[mc.slug] ?? []).map(cat => {
                            const selected = (perm.allowedCategories ?? []).includes(cat.slug)
                            return (
                              <button
                                key={cat.slug}
                                onClick={() => toggleCategory(scope.id, mc.slug, cat.slug)}
                                className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${
                                  selected
                                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                    : 'border-stone-100 text-stone-500 hover:border-stone-300 bg-stone-50'
                                }`}
                              >
                                {selected && <span className="mr-1">✓</span>}
                                {cat.name}
                              </button>
                            )
                          })}
                        </div>
                        {(perm.allowedCategories ?? []).length === 0 && (
                          <p className="text-[10px] text-amber-600 mt-1.5">⚠ No categories selected — this type won't appear on home.</p>
                        )}

                        {/* Item-level selection within each allowed category */}
                        {(perm.allowedCategories ?? []).map(catSlug => {
                          const cat = (catsByType[mc.slug] ?? []).find(c => c.slug === catSlug)
                          const items = itemsByCat[`${mc.slug}::${catSlug}`] ?? []
                          if (items.length === 0) return null
                          const selectedItems = perm.allowedItems ?? []
                          const catItemIds = items.map(i => i._id)
                          const allItemsSelected = catItemIds.every(id => selectedItems.includes(id))
                          return (
                            <div key={catSlug} className="mt-3 ml-2 pl-3 border-l-2 border-stone-200">
                              <div className="flex items-center justify-between mb-1.5">
                                <span className="text-[11px] text-stone-600 font-semibold">{cat?.name ?? catSlug} — Items</span>
                                <button
                                  onClick={() => {
                                    const otherItems = selectedItems.filter(id => !catItemIds.includes(id))
                                    updateLocal(scope.id, mc.slug, { allowedItems: allItemsSelected ? otherItems : [...otherItems, ...catItemIds] })
                                  }}
                                  className="text-[10px] text-stone-400 hover:text-stone-600 font-medium"
                                >
                                  {allItemsSelected ? 'Deselect All' : 'Select All'}
                                </button>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {items.map(item => {
                                  const picked = selectedItems.includes(item._id)
                                  return (
                                    <button
                                      key={item._id}
                                      onClick={() => toggleItem(scope.id, mc.slug, item._id)}
                                      className={`px-2.5 py-1 text-[11px] font-medium rounded-md border transition-all ${
                                        picked
                                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                                          : 'border-stone-100 text-stone-400 hover:border-stone-300 bg-stone-50'
                                      }`}
                                    >
                                      {picked && <span className="mr-1">✓</span>}
                                      {item.name}
                                    </button>
                                  )
                                })}
                              </div>
                              {catItemIds.every(id => !selectedItems.includes(id)) && (
                                <p className="text-[10px] text-stone-400 mt-1">No items selected — all published items in this category will show.</p>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                    {scope.id === 'studio-placement' && perm.enabled && (
                      <div className="mt-3 flex items-center gap-3">
                        <span className="text-xs text-stone-500 w-24 shrink-0">Placement role:</span>
                        <div className="flex gap-2">
                          {ROLES.map(role => (
                            <button key={role.label} onClick={() => updateLocal(scope.id, mc.slug, { placementRole: role.value as any })} title={role.desc}
                              className={`px-3 py-1.5 text-xs font-medium rounded-lg border-2 transition-all ${(perm.placementRole ?? null) === role.value ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 text-stone-600 hover:border-stone-300 bg-stone-50'}`}>
                              {role.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
        <div className="flex items-center gap-3 pt-2 pb-8">
          <button onClick={handleSave} disabled={saving} className={`px-6 py-2.5 text-sm font-semibold rounded-xl transition-all ${saving ? 'bg-stone-400 text-white' : saved ? 'bg-emerald-600 text-white' : 'bg-stone-900 text-white hover:bg-stone-700'}`}>
            {saving ? 'Saving…' : saved ? '✓ Saved!' : 'Save Permissions'}
          </button>
          {saved && <span className="text-xs text-emerald-600 font-medium">All permissions saved.</span>}
        </div>
      </div>
    </div>
  )
}
