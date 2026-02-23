import React, { useEffect, useRef, useState } from 'react'
import { EditorProvider } from '../context/EditorContext'
import { useEditor } from '../context/useEditor'
import KonvaEditor from './editor/KonvaEditor'
import EditorToolbar from './editor/EditorToolbar'
import PagesPanel from './editor/PagesPanel'
import PropertiesPanel from './PropertiesPanel'
import { downloadJSON, downloadSVG, downloadAllSVGs } from '../utils/exportUtils'
import { templateApi, stickerApi } from '../api/apiClient'
import type { Page } from '../types/editor'

type Props = {
  onBack: () => void
  documentType?: 'template' | 'sticker'
  editingId?: string | null
  onSaved?: (id: string) => void
}

type SaveState = 'idle' | 'saving' | 'saved' | 'error'

function EditorInner({
  onBack,
  editingId,
  onSaved,
}: {
  onBack: () => void
  editingId?: string | null
  onSaved?: (id: string) => void
}) {
  const {
    state, setDocName, undo, redo, deleteSelected, setZoom, setTool,
  } = useEditor()
  const { documentName, zoom, pages, documentType } = state

  const [showExportMenu, setShowExportMenu] = useState(false)
  const [saveState, setSaveState]           = useState<SaveState>('idle')
  const [saveError, setSaveError]           = useState<string | null>(null)
  const [docId, setDocId]                   = useState<string | null>(editingId ?? null)
  const [showNameModal, setShowNameModal]   = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

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

  const handleSave = async (overrideName?: string) => {
    const name = overrideName ?? documentName
    if (!name || name === 'Untitled') {
      setShowNameModal(true)
      return
    }
    setSaveState('saving')
    setSaveError(null)
    const api = documentType === 'sticker' ? stickerApi : templateApi
    try {
      if (!docId) {
        const res = await api.create({ name, pages: pages as any })
        const newId = res.data?._id
        if (newId) {
          setDocId(newId)
          onSaved?.(newId)
        }
      } else {
        await Promise.all([
          api.update(docId, { name }),
          api.savePages(docId, pages as any),
        ])
      }
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2500)
    } catch (e: any) {
      setSaveState('error')
      setSaveError(e.message ?? 'Save failed')
      setTimeout(() => { setSaveState('idle'); setSaveError(null) }, 4000)
    }
  }

  const currentPage = pages[state.currentPageIndex]

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-stone-100 min-h-0">
      {/* ── Top bar ── */}
      <div className="h-12 bg-white border-b border-stone-200 flex items-center justify-between px-4 shrink-0 gap-2">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            title="Back"
            className="p-1.5 rounded text-stone-400 hover:text-stone-800 hover:bg-stone-100 transition-colors shrink-0"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </button>
          <div className="h-4 w-px bg-stone-200 shrink-0" />
          <input
            value={documentName}
            onChange={e => setDocName(e.target.value)}
            className="text-sm font-medium text-stone-900 bg-transparent border-b border-transparent hover:border-stone-300 focus:border-sky-400 focus:outline-none truncate min-w-0 max-w-[200px]"
          />
          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold shrink-0 ${
            documentType === 'sticker' ? 'bg-violet-100 text-violet-700' : 'bg-sky-100 text-sky-700'
          }`}>
            {documentType}
          </span>
          {docId && (
            <span className="text-[10px] text-stone-400 shrink-0 font-mono hidden md:inline">
              #{docId.slice(-6)}
            </span>
          )}
        </div>

        {/* Centre — undo/redo/zoom */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={undo}
            title="Undo (Ctrl+Z)"
            className="p-1.5 rounded hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/>
            </svg>
          </button>
          <button
            onClick={redo}
            title="Redo (Ctrl+Y)"
            className="p-1.5 rounded hover:bg-stone-100 text-stone-500 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3L21 13"/>
            </svg>
          </button>
          <div className="h-4 w-px bg-stone-200 mx-1" />
          <button onClick={() => setZoom(Math.max(0.1, zoom - 0.1))} className="p-1.5 rounded hover:bg-stone-100 text-stone-500 text-sm transition-colors">−</button>
          <span className="text-xs font-mono text-stone-600 w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(Math.min(3, zoom + 0.1))} className="p-1.5 rounded hover:bg-stone-100 text-stone-500 text-sm transition-colors">+</button>
          <button onClick={() => setZoom(1)} className="text-[10px] px-1.5 py-1 rounded hover:bg-stone-100 text-stone-500 ml-1 transition-colors">1:1</button>
        </div>

        {/* Right — export / save */}
        <div className="flex items-center gap-2 shrink-0">
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
                <svg className="animate-spin" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                Saving…
              </>
            ) : saveState === 'saved' ? (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                Saved!
              </>
            ) : saveState === 'error' ? '⚠ Retry' : (
              <>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── Error toast ── */}
      {saveError && saveState === 'error' && (
        <div className="mx-4 mt-2 px-3 py-2 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2 shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/></svg>
          Save failed: {saveError}
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

          {/* Pages panel */}
          <PagesPanel />
        </div>

        {/* Right properties */}
        <PropertiesPanel />
      </div>

      {/* ── Name modal ── */}
      {showNameModal && (
        <NameModal
          defaultName={documentName === 'Untitled' ? '' : documentName}
          documentType={documentType}
          onConfirm={name => {
            setShowNameModal(false)
            setDocName(name)
            handleSave(name)
          }}
          onCancel={() => setShowNameModal(false)}
        />
      )}
    </div>
  )
}

function NameModal({
  defaultName,
  documentType,
  onConfirm,
  onCancel,
}: {
  defaultName: string
  documentType: string
  onConfirm: (name: string) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(defaultName)
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
      <div className="bg-white rounded-2xl shadow-2xl w-80 p-6">
        <h2 className="text-base font-semibold text-stone-900 mb-1">Name your {documentType}</h2>
        <p className="text-xs text-stone-400 mb-4">Give it a descriptive name before saving.</p>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && name.trim()) onConfirm(name.trim()) }}
          placeholder={`e.g. "Daily Planner 2026"`}
          className="w-full px-3 py-2 text-sm border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-300 mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 text-sm font-medium text-stone-600 border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => name.trim() && onConfirm(name.trim())}
            disabled={!name.trim()}
            className="flex-1 py-2 text-sm font-semibold bg-stone-900 text-white rounded-lg hover:bg-stone-700 transition-colors disabled:opacity-50"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function EditorLoading({ documentType }: { documentType: string }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-3 text-stone-400">
      <svg className="animate-spin" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
      </svg>
      <span className="text-sm">Loading {documentType}…</span>
    </div>
  )
}

export default function EditorView({
  onBack,
  documentType = 'template',
  editingId,
  onSaved,
}: Props) {
  const [initialData, setInitialData]         = useState<{ name: string; pages: Page[] } | null>(null)
  const [loadError, setLoadError]             = useState<string | null>(null)
  const [loadingExisting, setLoadingExisting] = useState(!!editingId)

  useEffect(() => {
    if (!editingId) return
    const api = documentType === 'sticker' ? stickerApi : templateApi
    api.get(editingId)
      .then(res => setInitialData({ name: res.data?.name ?? 'Untitled', pages: res.data?.pages ?? [] }))
      .catch(e => setLoadError(e.message ?? 'Failed to load'))
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
      <EditorInner onBack={onBack} editingId={editingId} onSaved={onSaved} />
    </EditorProvider>
  )
}

