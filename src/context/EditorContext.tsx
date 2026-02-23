import React, { useCallback, useReducer, useRef } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { DocumentType, EditorState, Page, Tool, CanvasElement } from '../types/editor'
import { EditorContext } from './EditorContextDef'
import type { Action } from './EditorContextDef'

const TEMPLATE_W = 595   
const TEMPLATE_H = 842
const STICKER_W  = 400
const STICKER_H  = 400

function makeBlankPage(name: string, w: number, h: number): Page {
  return { id: uuidv4(), name, elements: [], background: '#ffffff', width: w, height: h }
}

const MAX_HISTORY = 50

function clonePages(pages: Page[]): Page[] {
  return pages.map(p => ({ ...p, elements: p.elements.map(e => ({ ...e })) }))
}

function pushHistory(state: EditorState): Pick<EditorState, 'history' | 'historyIndex'> {
  const snapshot = clonePages(state.pages)
  const prev = state.history.slice(0, state.historyIndex + 1)
  const next = [...prev, snapshot].slice(-MAX_HISTORY)
  return { history: next, historyIndex: next.length - 1 }
}

function reducer(state: EditorState, action: Action): EditorState {
  switch (action.type) {
    case 'SET_TOOL':
      return { ...state, activeTool: action.tool, selectedId: null }

    case 'SELECT':
      return { ...state, selectedId: action.id }

    case 'ADD_PAGE': {
      const { pages } = state
      const w = pages[0]?.width  ?? TEMPLATE_W
      const h = pages[0]?.height ?? TEMPLATE_H
      const newPage = makeBlankPage(`Page ${pages.length + 1}`, w, h)
      const newPages = [...pages, newPage]
      return {
        ...state,
        pages: newPages,
        currentPageIndex: newPages.length - 1,
        selectedId: null,
        ...pushHistory(state),
      }
    }

    case 'DELETE_PAGE': {
      if (state.pages.length <= 1) return state
      const newPages = state.pages.filter(p => p.id !== action.pageId)
      const currentPageIndex = Math.min(state.currentPageIndex, newPages.length - 1)
      return {
        ...state,
        pages: newPages,
        currentPageIndex,
        selectedId: null,
        ...pushHistory(state),
      }
    }

    case 'RENAME_PAGE': {
      const pages = state.pages.map(p =>
        p.id === action.pageId ? { ...p, name: action.name } : p
      )
      return { ...state, pages }
    }

    case 'REORDER_PAGES': {
      if (action.activeIndex === action.overIndex) return state
      const newPages = [...state.pages]
      const [moved] = newPages.splice(action.activeIndex, 1)
      newPages.splice(action.overIndex, 0, moved)
      
      let newCurrentPageIndex = state.currentPageIndex
      if (state.currentPageIndex === action.activeIndex) {
        newCurrentPageIndex = action.overIndex
      } else if (
        state.currentPageIndex >= Math.min(action.activeIndex, action.overIndex) &&
        state.currentPageIndex <= Math.max(action.activeIndex, action.overIndex)
      ) {
        if (action.activeIndex < action.overIndex) {
          newCurrentPageIndex--
        } else {
          newCurrentPageIndex++
        }
      }

      return {
        ...state,
        pages: newPages,
        currentPageIndex: newCurrentPageIndex,
        ...pushHistory(state)
      }
    }

    case 'SET_PAGE':
      return { ...state, currentPageIndex: action.index, selectedId: null }

    case 'ADD_ELEMENT': {
      const histSnap = pushHistory(state)
      const pages = state.pages.map((p, i) =>
        i === state.currentPageIndex
          ? { ...p, elements: [...p.elements, action.element] }
          : p
      )
      return { ...state, pages, selectedId: action.element.id, ...histSnap }
    }

    case 'UPDATE_ELEMENT': {
      const pages = state.pages.map((p, i) =>
        i === state.currentPageIndex
          ? {
              ...p,
              elements: p.elements.map(el =>
                el.id === action.id ? { ...el, ...action.changes } : el
              ),
            }
          : p
      )
      return { ...state, pages }
    }

    case 'DELETE_ELEMENT': {
      const histSnap = pushHistory(state)
      const pages = state.pages.map((p, i) =>
        i === state.currentPageIndex
          ? { ...p, elements: p.elements.filter(el => el.id !== action.id) }
          : p
      )
      return { ...state, pages, selectedId: null, ...histSnap }
    }

    case 'REORDER_ELEMENT': {
      const page = state.pages[state.currentPageIndex]
      const idx = page.elements.findIndex(e => e.id === action.id)
      if (idx < 0) return state
      const els = [...page.elements]
      let target = idx
      if (action.direction === 'up' && idx < els.length - 1) target = idx + 1
      if (action.direction === 'down' && idx > 0) target = idx - 1
      if (action.direction === 'top') target = els.length - 1
      if (action.direction === 'bottom') target = 0
      const [el] = els.splice(idx, 1)
      els.splice(target, 0, el)
      const pages = state.pages.map((p, i) =>
        i === state.currentPageIndex ? { ...p, elements: els } : p
      )
      return { ...state, pages }
    }

    case 'SET_BG': {
      const pages = state.pages.map((p, i) =>
        i === state.currentPageIndex ? { ...p, background: action.color } : p
      )
      return { ...state, pages }
    }

    case 'SET_DOC_NAME':
      return { ...state, documentName: action.name }

    case 'SET_DOC_TYPE': {
      const w = action.docType === 'sticker' ? STICKER_W : TEMPLATE_W
      const h = action.docType === 'sticker' ? STICKER_H : TEMPLATE_H
      const pages = state.pages.map(p => ({ ...p, width: w, height: h }))
      return { ...state, documentType: action.docType, pages }
    }

    case 'SET_ZOOM':
      return { ...state, zoom: Math.min(3, Math.max(0.1, action.zoom)) }

    case 'UNDO': {
      if (state.historyIndex <= 0) return state
      const historyIndex = state.historyIndex - 1
      const pages = clonePages(state.history[historyIndex])
      const currentPageIndex = Math.min(state.currentPageIndex, pages.length - 1)
      return { ...state, pages, currentPageIndex, selectedId: null, historyIndex }
    }

    case 'REDO': {
      if (state.historyIndex >= state.history.length - 1) return state
      const historyIndex = state.historyIndex + 1
      const pages = clonePages(state.history[historyIndex])
      const currentPageIndex = Math.min(state.currentPageIndex, pages.length - 1)
      return { ...state, pages, currentPageIndex, selectedId: null, historyIndex }
    }

    default:
      return state
  }
}

export function EditorProvider({
  children,
  initial,
}: {
  children: React.ReactNode
  initial?: { name?: string; type?: DocumentType; pages?: Page[] }
}) {
  const docType: DocumentType = initial?.type ?? 'template'
  const w = docType === 'sticker' ? STICKER_W : TEMPLATE_W
  const h = docType === 'sticker' ? STICKER_H : TEMPLATE_H

  const coverPage = makeBlankPage('Cover', w, h)
  const startPages: Page[] = (initial?.pages && initial.pages.length > 0)
    ? initial.pages
    : [coverPage]

  const initialState: EditorState = {
    documentName: initial?.name ?? 'Untitled',
    documentType: docType,
    pages: startPages,
    currentPageIndex: 0,
    selectedId: null,
    activeTool: 'select',
    history: [clonePages(startPages)],
    historyIndex: 0,
    zoom: 1,
  }

  const [state, dispatch] = useReducer(reducer, initialState)
  const stageRef = useRef<any>(null)

  const currentPage = state.pages[state.currentPageIndex]
  const selectedElement = currentPage?.elements.find(e => e.id === state.selectedId) ?? null

  const setTool     = useCallback((t: Tool) => dispatch({ type: 'SET_TOOL', tool: t }), [])
  const select      = useCallback((id: string | null) => dispatch({ type: 'SELECT', id }), [])
  const addElement  = useCallback((el: CanvasElement) => dispatch({ type: 'ADD_ELEMENT', element: el }), [])
  const updateElement = useCallback((id: string, changes: Partial<CanvasElement>) =>
    dispatch({ type: 'UPDATE_ELEMENT', id, changes }), [])
  const deleteSelected = useCallback(() => {
    if (state.selectedId) dispatch({ type: 'DELETE_ELEMENT', id: state.selectedId })
  }, [state.selectedId])
  const undo        = useCallback(() => dispatch({ type: 'UNDO' }), [])
  const redo        = useCallback(() => dispatch({ type: 'REDO' }), [])
  const addPage     = useCallback(() => dispatch({ type: 'ADD_PAGE' }), [])
  const setCurrentPage = useCallback((index: number) => dispatch({ type: 'SET_PAGE', index }), [])
  const reorderPages = useCallback((activeIndex: number, overIndex: number) => 
    dispatch({ type: 'REORDER_PAGES', activeIndex, overIndex }), [])
  const setZoom     = useCallback((z: number) => dispatch({ type: 'SET_ZOOM', zoom: z }), [])
  const setDocName  = useCallback((name: string) => dispatch({ type: 'SET_DOC_NAME', name }), [])
  const setDocType  = useCallback((t: DocumentType) => dispatch({ type: 'SET_DOC_TYPE', docType: t }), [])
  const setBackground = useCallback((color: string) => dispatch({ type: 'SET_BG', color }), [])
  const reorderElement = useCallback((id: string, dir: 'up' | 'down' | 'top' | 'bottom') =>
    dispatch({ type: 'REORDER_ELEMENT', id, direction: dir }), [])

  return (
    <EditorContext.Provider
      value={{
        state,
        dispatch,
        currentPage,
        selectedElement,
        setTool,
        select,
        addElement,
        updateElement,
        deleteSelected,
        undo,
        redo,
        addPage,
        setCurrentPage,
        reorderPages,
        setZoom,
        setDocName,
        setDocType,
        setBackground,
        reorderElement,
        stageRef,
      }}
    >
      {children}
    </EditorContext.Provider>
  )
}


