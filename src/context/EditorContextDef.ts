import { createContext } from 'react'
import type { Dispatch, RefObject } from 'react'
import type {
  CanvasElement,
  DocumentType,
  EditorState,
  Page,
  Tool,
} from '../types/editor'

export type Action =
  | { type: 'SET_TOOL'; tool: Tool }
  | { type: 'SELECT'; id: string | null }
  | { type: 'ADD_PAGE' }
  | { type: 'LOAD_PAGES'; pages: Page[] }
  | { type: 'DELETE_PAGE'; pageId: string }
  | { type: 'RENAME_PAGE'; pageId: string; name: string }
  | { type: 'SET_PAGE'; index: number }
  | { type: 'REORDER_PAGES'; activeIndex: number; overIndex: number }
  | { type: 'ADD_ELEMENT'; element: CanvasElement }
  | { type: 'UPDATE_ELEMENT'; id: string; changes: Partial<CanvasElement> }
  | { type: 'DELETE_ELEMENT'; id: string }
  | { type: 'REORDER_ELEMENT'; id: string; direction: 'up' | 'down' | 'top' | 'bottom' }
  | { type: 'SET_BG'; color: string }
  | { type: 'SET_DOC_NAME'; name: string }
  | { type: 'SET_DOC_TYPE'; docType: DocumentType }
  | { type: 'SET_ZOOM'; zoom: number }
  | { type: 'UNDO' }
  | { type: 'REDO' }

export interface EditorContextValue {
  state: EditorState
  dispatch: Dispatch<Action>
  currentPage: Page
  selectedElement: CanvasElement | null
  setTool: (t: Tool) => void
  select: (id: string | null) => void
  addElement: (el: CanvasElement) => void
  updateElement: (id: string, changes: Partial<CanvasElement>) => void
  deleteSelected: () => void
  undo: () => void
  redo: () => void
  addPage: () => void
  setCurrentPage: (index: number) => void
  reorderPages: (activeIndex: number, overIndex: number) => void
  setZoom: (z: number) => void
  setDocName: (n: string) => void
  setDocType: (t: DocumentType) => void
  setBackground: (color: string) => void
  reorderElement: (id: string, dir: 'up' | 'down' | 'top' | 'bottom') => void
  loadPages: (pages: Page[]) => void
  stageRef: RefObject<any> // eslint-disable-line @typescript-eslint/no-explicit-any
}

export const EditorContext = createContext<EditorContextValue | null>(null)
