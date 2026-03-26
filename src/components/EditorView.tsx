import React, { useEffect, useRef, useState } from 'react'
import { EditorProvider } from '../context/EditorContext'
import { useEditor } from '../context/useEditor'
import KonvaEditor from './editor/KonvaEditor'
import EditorToolbar from './editor/EditorToolbar'
import PagesPanel from './editor/PagesPanel'
import PropertiesPanel from './PropertiesPanel'
import { downloadJSON, downloadSVG, downloadAllSVGs } from '../utils/exportUtils'
import { pdfApi, categoryApi, mediaApi } from '../api/apiClient'
import type { PdfJobStatus } from '../api/apiClient'
import ContentService from '../services/contentService'
import { useAppDispatch } from '../api/hooks'
import { createContent, updateContent } from '../actions/contentAction'
import type { Page } from '../types/editor'
import backIcon from '../assets/icons/back.svg'
import undoIcon from '../assets/icons/undo.svg'
import redoIcon from '../assets/icons/redo.svg'
import spinnerIcon from '../assets/icons/spinner.svg'
import importPdfIcon from '../assets/icons/import-pdf.svg'
import fileIcon from '../assets/icons/file.svg'
import checkIcon from '../assets/icons/check.svg'
import infoIcon from '../assets/icons/info.svg'

type Props = {
  onBack: () => void
  documentType?: string
  editingId?: string | null
  onSaved?: (id: string) => void
  singlePageMode?: boolean
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function EditorInner({
  onBack,
  editingId,
  onSaved,
  initialIsPublished,
  singlePageMode,
}: {
  onBack: () => void
  editingId?: string | null
  onSaved?: (id: string) => void
  initialIsPublished?: boolean
  singlePageMode?: boolean
}) {
  const dispatch = useAppDispatch()
  const {
    state, setDocName, undo, redo, deleteSelected, setZoom, setTool, loadPages,
    stageRef, setCurrentPage, select,
  } = useEditor()
  const { documentName, zoom, pages, documentType } = state

  const [showExportMenu, setShowExportMenu]   = useState(false)
  const [saveState, setSaveState]             = useState<SaveState>('idle')
  const [saveError, setSaveError]             = useState<string | null>(null)
  const [docId, setDocId]                     = useState<string | null>(editingId ?? null)
  const [showNameModal, setShowNameModal]     = useState(false)
  const [savedCategory, setSavedCategory]     = useState<string | undefined>()
  const [savedSubcategory, setSavedSubcategory] = useState<string | undefined>()
  const [pdfImporting, setPdfImporting]     = useState(false)
  const [pdfImportError, setPdfImportError] = useState<string | null>(null)
  const [pdfProgress, setPdfProgress]       = useState<string>('')
  const [isPublished,    setIsPublished]    = useState<boolean>(initialIsPublished ?? true)
  const [publishState,   setPublishState]  = useState<'idle' | 'toggling'>('idle')
  const exportRef   = useRef<HTMLDivElement>(null)
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const generateCoverImage = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      const stage = stageRef.current
      if (!stage || !pages.length) return resolve(null)
      const prevPage = state.currentPageIndex
      const prevSelected = state.selectedId
      const needSwitch = prevPage !== 0

      select(null)

      const restore = () => {
        if (needSwitch) setCurrentPage(prevPage)
        if (prevSelected) select(prevSelected)
      }

      const capture = () => {
        try {
          const dataUrl = stage.toDataURL({ pixelRatio: 1, mimeType: 'image/png' })
          fetch(dataUrl)
            .then(r => r.blob())
            .then(blob => { restore(); resolve(blob) })
            .catch(() => { restore(); resolve(null) })
        } catch {
          restore()
          resolve(null)
        }
      }
      if (needSwitch) {
        setCurrentPage(0)
        // Wait for Konva to re-render page 0 without selection
        requestAnimationFrame(() => requestAnimationFrame(capture))
      } else {
        // Wait one frame for deselection to clear the transformer
        requestAnimationFrame(capture)
      }
    })
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!exportRef.current?.contains(e.target as Node)) setShowExportMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const active = document.activeElement
      if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') { e.preventDefault(); undo() }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'Z'))) { e.preventDefault(); redo() }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); handleSave() }
      if (e.key === 'Delete' || e.key === 'Backspace') { e.preventDefault(); deleteSelected() }
      if (e.key === '=' || e.key === '+') setZoom(Math.min(3, zoom + 0.1))
      if (e.key === '-') setZoom(Math.max(0.1, zoom - 0.1))
      if (e.key === '0') setZoom(1)
      if (!e.ctrlKey && !e.metaKey) {
        if (e.key === 'v' || e.key === 'V') setTool('select')
        if (e.key === 'h' || e.key === 'H') setTool('pan')
        if (e.key === 't' || e.key === 'T') setTool('text')
        if (e.key === 'r' || e.key === 'R') setTool('rect')
        if (e.key === 'e' || e.key === 'E') setTool('circle')
        if (e.key === 'l' || e.key === 'L') setTool('line')
        if (e.key === 'p' || e.key === 'P') setTool('pen')
        if (e.key === 'i' || e.key === 'I') setTool('image')
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, deleteSelected, setZoom, zoom, docId, documentName, pages, documentType])

  const handleTogglePublish = async () => {
    if (!docId) return
    setPublishState('toggling')
    try {
      const res = await ContentService.publish(docId, !isPublished)
      setIsPublished(res.data?.isPublished ?? !isPublished)
    } catch (e: any) {
      alert(e.message ?? 'Failed to update publish state')
    } finally {
      setPublishState('idle')
    }
  }

  const handleSave = async (overrideName?: string, overrideCat?: string, overrideSub?: string) => {
    const name = overrideName ?? documentName
    if (!name || name === 'Untitled') {
      setShowNameModal(true)
      return
    }
    setSaveState('saving')
    setSaveError(null)
    const category    = overrideCat ?? savedCategory
    const subcategory = overrideSub ?? savedSubcategory
    try {
      let savedId = docId
      if (!docId) {
        const res = await dispatch(createContent({
          name,
          itemType: documentType || 'content',
          category,
          subcategory,
          pages: pages as object[],
        })).unwrap()
        const newId = res.data?._id
        if (newId) {
          savedId = newId
          setDocId(newId)
          setIsPublished(res.data?.isPublished ?? true)
          if (category)    setSavedCategory(category)
          if (subcategory) setSavedSubcategory(subcategory)
          onSaved?.(newId)
        }
      } else {
        await ContentService.saveAll(docId, {
          name,
          category,
          subcategory,
          pages: pages as object[],
        })
        if (category)    setSavedCategory(category)
        if (subcategory) setSavedSubcategory(subcategory)
      }

      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)

      if (savedId && pages.length > 0) {
        generateCoverImage()
          .then(async (blob) => {
            if (!blob || !savedId) return
            const file = new File([blob], `cover-${savedId}.png`, { type: 'image/png' })
            const uploadRes = await mediaApi.upload(file)
            const url = uploadRes?.data?.url
            if (url) {
              await dispatch(updateContent({ id: savedId, body: { coverImageUrl: url } })).unwrap()
            }
          })
          .catch(() => {
            // Cover generation is non-critical — silently ignore
          })
      }
    } catch (e: any) {
      setSaveState('error')
      setSaveError(e.message ?? 'Save failed')
      setTimeout(() => { setSaveState('idle'); setSaveError(null) }, 4000)
    }
  }

  const currentPage = pages[state.currentPageIndex]

  const handlePdfFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    e.target.value = ''

    setPdfImporting(true)
    setPdfImportError(null)
    setPdfProgress('Uploading PDF…')
    try {
      const res = await pdfApi.importPdf(file, (status: PdfJobStatus) => {
        if (status.status === 'processing') {
          const pct = status.progress ?? 0
          setPdfProgress(
            pct > 0
              ? `Processing… ${pct}%`
              : status.message || 'Processing…'
          )
        } else if (status.status === 'pending') {
          setPdfProgress('Queued for processing…')
        }
      })

      const importedPages: Page[] = res.data?.pages ?? []
      if (!importedPages.length) throw new Error('No pages returned from server')

      setPdfProgress(`Loading ${importedPages.length} pages…`)

      const fonts = res.data?.fonts ?? []
      if (fonts.length) {
        console.log('[PDF Import] Detected fonts:', fonts.map((f: { name: string; style: string; embeddedFile?: string }) =>
          `${f.name} (${f.style})${f.embeddedFile ? ' ✓embedded' : ''}`
        ).join(', '))

        const loadedFaces = new Set<string>()
        const fontPromises: Promise<void>[] = []

        for (const font of fonts) {
          if (!font.embeddedFile) continue

          const family = font.family || font.name || 'Arial'
          const style = (font.italic || /italic|oblique/i.test(font.style || '')) ? 'italic' : 'normal'
          const weight = (font.bold || /bold|black|heavy|semibold/i.test(font.style || '')) ? '700' : '400'
          const cacheKey = `${family}|${style}|${weight}|${font.embeddedFile}`
          if (loadedFaces.has(cacheKey)) continue
          loadedFaces.add(cacheKey)

          fontPromises.push(
            (async () => {
              try {
                const fontFace = new FontFace(family, `url(${font.embeddedFile})`, { style, weight })
                const loaded = await fontFace.load()
                document.fonts.add(loaded)
                console.log(`[PDF Import] Loaded font: ${family} (${weight} ${style})`)
              } catch (fontErr) {
                console.warn(`[PDF Import] Could not load font ${font.name}:`, fontErr)
              }
            })()
          )
        }

        await Promise.allSettled(fontPromises)
      }

      loadPages(importedPages)
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      const msg = e?.response?.data?.message ?? e?.message ?? 'PDF import failed'
      setPdfImportError(msg)
      setTimeout(() => setPdfImportError(null), 8000)
    } finally {
      setPdfImporting(false)
      setPdfProgress('')
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-100 min-h-0">
      <div className="h-12 bg-white border-b border-stone-200 flex items-center justify-between px-4 shrink-0 gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            title="Back"
            className="p-1.5 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors shrink-0"
          >
            <img src={backIcon} alt="Back" width={16} height={16} />
          </button>
          <div className="h-4 w-px bg-stone-200 shrink-0" />
          <input
            value={documentName}
            onChange={e => setDocName(e.target.value)}
            className="text-sm font-medium text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-sky-400 focus:outline-none truncate min-w-0 max-w-[200px]"
          />
          <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 bg-stone-100 text-stone-700 capitalize">
            {documentType}
          </span>
          {docId && (
            <span className="text-[10px] text-stone-400 shrink-0 font-mono hidden md:inline">
              #{docId.slice(-6)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <img src={undoIcon} alt="Undo" width={14} height={14} />
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <img src={redoIcon} alt="Redo" width={14} height={14} />
          </button>
          <div className="h-4 w-px bg-stone-200 mx-1" />
          <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 rounded hover:bg-stone-100 text-stone-500 text-sm transition-colors">−</button>
          <span className="text-xs font-mono text-stone-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 rounded hover:bg-stone-100 text-stone-500 text-sm transition-colors">+</button>
          <button onClick={() => setZoom(1)} className="text-[10px] px-1.5 py-1 rounded hover:bg-stone-100 text-stone-500 ml-1 transition-colors">1:1</button>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <input
            ref={pdfInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={handlePdfFileChange}
          />

          {/* Import PDF button */}
          <button
            onClick={() => pdfInputRef.current?.click()}
            disabled={pdfImporting}
            title="Import a PDF and convert it to editable canvas elements"
            className={`text-xs font-medium px-3 py-1.5 rounded border transition-colors flex items-center gap-1.5 ${
              pdfImporting
                ? 'border-amber-300 bg-amber-50 text-amber-600 cursor-not-allowed'
                : 'border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400'
            }`}
          >
            {pdfImporting ? (
              <>
                <img src={spinnerIcon} alt="Loading" className="animate-spin" width={12} height={12} />
                {pdfProgress || 'Importing…'}
              </>
            ) : (
              <>
                <img src={importPdfIcon} alt="Import PDF" width={12} height={12} />
                Import PDF
              </>
            )}
          </button>
          <div ref={exportRef} className="relative">
            <button
              onClick={() => setShowExportMenu(v => !v)}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 px-3 py-1.5 rounded border border-stone-200 hover:border-stone-400 transition-colors"
            >
              Export ▾
            </button>
            {showExportMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-stone-200 rounded-lg shadow-xl z-50 py-1">
                <button
                  onClick={() => { downloadJSON(pages, documentName, documentType); setShowExportMenu(false) }}
                  className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  📄 Download JSON
                </button>
                <button
                  onClick={() => { downloadSVG(currentPage, documentName); setShowExportMenu(false) }}
                  className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  🖼 Current Page SVG
                </button>
                <button
                  onClick={() => { downloadAllSVGs(pages, documentName); setShowExportMenu(false) }}
                  className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 transition-colors"
                >
                  📦 All Pages SVG
                </button>
              </div>
            )}
          </div>

          {docId && (
            <button
              onClick={handleTogglePublish}
              disabled={publishState === 'toggling'}
              title={isPublished ? 'Click to unpublish' : 'Click to publish'}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1.5 disabled:opacity-50 ${
                isPublished
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
              }`}
            >
              {publishState === 'toggling' ? (
                <img src={spinnerIcon} alt="Loading" className="animate-spin" width={12} height={12} />
              ) : isPublished ? (
                <img src={checkIcon} alt="Published" width={12} height={12} />
              ) : (
                <img src={infoIcon} alt="Draft" width={12} height={12} />
              )}
              {publishState === 'toggling' ? '…' : isPublished ? 'Published' : 'Draft'}
            </button>
          )}

          {/* Save button */}
          <button
            onClick={() => handleSave()}
            disabled={saveState === 'saving'}
            className={`px-4 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
              saveState === 'saving'  ? 'bg-stone-400 text-white cursor-not-allowed' :
              saveState === 'saved'   ? 'bg-emerald-600 text-white' :
              saveState === 'error'   ? 'bg-rose-600 text-white' :
              'bg-stone-900 text-white hover:bg-stone-700'
            }`}
          >
            {saveState === 'saving' ? (
              <>
                <img src={spinnerIcon} alt="Saving" className="animate-spin" width={12} height={12} />
                Saving…
              </>
            ) : saveState === 'saved' ? (
              <>
                <img src={checkIcon} alt="Saved" width={12} height={12} />
                Saved!
              </>
            ) : saveState === 'error' ? '⚠ Retry' : (
              <>
                <img src={fileIcon} alt="Save" width={12} height={12} />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {saveError && saveState === 'error' && (
        <div className="mx-4 mt-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 shrink-0">
          <img src={infoIcon} alt="Error" width={14} height={14} />
          Save failed: {saveError}
        </div>
      )}
      {pdfImportError && (
        <div className="mx-4 mt-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 shrink-0">
          <img src={infoIcon} alt="PDF error" width={14} height={14} />
          PDF import failed: {pdfImportError}
        </div>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Left toolbar */}
        <EditorToolbar />

        {/* Canvas area */}
        <div className="flex-1 flex flex-col overflow-hidden min-h-0">
          <div
            className="flex-1 min-h-0 overflow-auto flex items-center justify-center p-8"
            style={{
              backgroundImage: 'radial-gradient(circle, #c8c8c8 1px, transparent 1px)',
              backgroundSize: '20px 20px',
              backgroundColor: '#f0eeeb',
            }}
          >
            <div className="shadow-2xl rounded-sm overflow-hidden">
              <KonvaEditor />
            </div>
          </div>

          <PagesPanel singlePageMode={singlePageMode} />
        </div>

        <PropertiesPanel />
      </div>

      {showNameModal && (
        <SaveModal
          defaultName={documentName === 'Untitled' ? '' : documentName}
          documentType={documentType}
          onConfirm={(name, cat, sub) => {
            setShowNameModal(false)
            setDocName(name)
            handleSave(name, cat, sub)
          }}
          onCancel={() => setShowNameModal(false)}
        />
      )}
    </div>
  )
}

interface CatItem { _id: string; name: string; slug: string; color: string; subcategories: { name: string; slug: string }[] }

function SaveModal({
  defaultName, documentType, onConfirm, onCancel,
}: {
  defaultName: string
  documentType: string
  onConfirm: (name: string, category?: string, subcategory?: string) => void
  onCancel: () => void
}) {
  const [name, setName]           = useState(defaultName)
  const [cats, setCats]           = useState<CatItem[]>([])
  const [selCat, setSelCat]       = useState('')
  const [selSub, setSelSub]       = useState('')
  const [step, setStep]           = useState<'name' | 'category' | 'subcategory'>('name')
  const [loadingCats, setLoadingCats] = useState(false)

  const currentCat = cats.find(c => c.slug === selCat)
  const hasSubs    = (currentCat?.subcategories?.length ?? 0) > 0

  const loadCats = async () => {
    setLoadingCats(true)
    try {
      const res = await categoryApi.list(documentType)
      setCats((res.data ?? []) as CatItem[])
    } finally { setLoadingCats(false) }
  }

  const handleNameNext = () => {
    if (!name.trim()) return
    loadCats()
    setStep('category')
  }

  const handleCategoryNext = () => {
    if (selCat && hasSubs) { setStep('subcategory'); return }
    onConfirm(name.trim(), selCat || undefined, undefined)
  }

  const handleSubNext = () => {
    onConfirm(name.trim(), selCat || undefined, selSub || undefined)
  }

  const stepLabels = ['Name', 'Category', ...(hasSubs ? ['Subcategory'] : [])]
  const currentStepIdx = step === 'name' ? 0 : step === 'category' ? 1 : 2

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100" onClick={e => { if (e.target === e.currentTarget) onCancel() }}>
      <div className="bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden">
        <div className="px-6 pt-5 pb-4 border-b border-stone-100">
          <h2 className="text-sm font-bold text-stone-900">Save {documentType}</h2>
          <div className="flex items-center gap-2 mt-3">
            {stepLabels.map((label, i) => (
              <React.Fragment key={label}>
                <div className={`flex items-center gap-1.5`}>
                  <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                    i < currentStepIdx ? 'bg-emerald-500 text-white' : i === currentStepIdx ? 'bg-stone-900 text-white' : 'bg-stone-100 text-stone-400'
                  }`}>
                    {i < currentStepIdx ? <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg> : i + 1}
                  </span>
                  <span className={`text-xs ${i === currentStepIdx ? 'font-semibold text-stone-900' : i < currentStepIdx ? 'text-emerald-600 font-medium' : 'text-stone-400'}`}>{label}</span>
                </div>
                {i < stepLabels.length - 1 && <div className={`flex-1 h-px ${i < currentStepIdx ? 'bg-emerald-300' : 'bg-stone-100'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>

        {step === 'name' && (
          <div className="px-6 py-5">
            <p className="text-xs text-stone-400 mb-3">Give your {documentType} a descriptive name.</p>
            <input
              autoFocus
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleNameNext() }}
              placeholder={`e.g. "My ${documentType} name"`}
              className="w-full px-3 py-2.5 text-sm border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-300 mb-5"
            />
            <div className="flex gap-2">
              <button onClick={onCancel} className="flex-1 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">Cancel</button>
              <button onClick={handleNameNext} disabled={!name.trim()} className="flex-1 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-700 disabled:opacity-50">Next →</button>
            </div>
          </div>
        )}

        {step === 'category' && (
          <div className="px-6 py-5">
            <p className="text-xs text-stone-400 mb-3">Choose a category <span className="text-stone-300">(optional)</span></p>
            {loadingCats ? (
              <div className="text-xs text-stone-400 text-center py-6">Loading categories…</div>
            ) : cats.length === 0 ? (
              <div className="text-xs text-stone-400 text-center py-6 bg-stone-50 rounded-xl mb-4">
                No categories set up yet — you can add them via the sidebar cog icon.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mb-4 max-h-52 overflow-y-auto">
                {cats.map(cat => (
                  <button key={cat.slug} onClick={() => setSelCat(c => c === cat.slug ? '' : cat.slug)}
                    className={`px-3 py-2.5 text-xs font-semibold rounded-xl border-2 text-left transition-all ${
                      selCat === cat.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 hover:border-stone-300 text-stone-700 bg-stone-50'
                    }`}
                  >
                    {cat.name}
                    {cat.subcategories.length > 0 && <span className="ml-1 opacity-50 text-[10px]">({cat.subcategories.length})</span>}
                  </button>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={() => setStep('name')} className="flex-1 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">← Back</button>
              <button onClick={handleCategoryNext} className="flex-1 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-700">
                {selCat && hasSubs ? 'Next →' : 'Save'}
              </button>
            </div>
          </div>
        )}

        {step === 'subcategory' && currentCat && (
          <div className="px-6 py-5">
            <p className="text-xs text-stone-400 mb-3">Choose a subcategory under <span className="font-semibold text-stone-700">{currentCat.name}</span> <span className="text-stone-300">(optional)</span></p>
            <div className="grid grid-cols-2 gap-2 mb-4 max-h-52 overflow-y-auto">
              {currentCat.subcategories.map(sub => (
                <button key={sub.slug} onClick={() => setSelSub(s => s === sub.slug ? '' : sub.slug)}
                  className={`px-3 py-2.5 text-xs font-semibold rounded-xl border-2 text-left transition-all ${
                    selSub === sub.slug ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-100 hover:border-stone-300 text-stone-700 bg-stone-50'
                  }`}
                >
                  {sub.name}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setStep('category'); setSelSub('') }} className="flex-1 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-xl hover:bg-stone-50">← Back</button>
              <button onClick={handleSubNext} className="flex-1 py-2 text-sm font-semibold bg-stone-900 text-white rounded-xl hover:bg-stone-700">Save</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function EditorLoading({ documentType }: { documentType: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
        <img src={spinnerIcon} alt="Loading" className="animate-spin" width={28} height={28} />
      <span className="text-sm">Loading {documentType}…</span>
    </div>
  )
}

export default function EditorView({
  onBack,
  documentType = 'content',
  editingId,
  onSaved,
  singlePageMode,
}: Props) {
  const [initialData, setInitialData]         = useState<{ name: string; pages: Page[]; isPublished?: boolean } | null>(null)
  const [loadError, setLoadError]             = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(!!editingId)

  useEffect(() => {
    if (!editingId) return
    ContentService.get(editingId)
      .then((res) =>
        setInitialData({
          name: res.data?.name ?? 'Untitled',
          pages: (res.data?.pages as Page[]) ?? [],
          isPublished: res.data?.isPublished,
        })
      )
      .catch((e: { message?: string }) => setLoadError(e.message ?? 'Failed to load'))
      .finally(() => setLoadingExisting(false))
  }, [editingId, documentType])

  if (loadingExisting) {
    return (
      <div className="flex-1 flex flex-col bg-stone-100">
        <EditorLoading documentType={documentType} />
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3">
        <p className="text-rose-600 text-sm">{loadError}</p>
        <button onClick={onBack} className="text-sm text-stone-600 hover:underline">← Back</button>
      </div>
    )
  }

  return (
    <EditorProvider initial={{
      type: documentType,
      name: initialData?.name ?? 'Untitled',
      pages: initialData?.pages,
    }}>
      <EditorInner onBack={onBack} editingId={editingId} onSaved={onSaved} initialIsPublished={initialData?.isPublished} singlePageMode={singlePageMode} />
    </EditorProvider>
  )
}

