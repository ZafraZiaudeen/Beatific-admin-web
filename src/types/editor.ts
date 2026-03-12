export type Tool =
  | 'select'
  | 'pan'
  | 'text'
  | 'rect'
  | 'circle'
  | 'line'
  | 'arrow'
  | 'star'
  | 'triangle'
  | 'hexagon'
  | 'pentagon'
  | 'diamond'
  | 'image'
  | 'pen'

export type DocumentType = string

export interface CanvasElement {
  id: string
  type: 'rect' | 'circle' | 'text' | 'image' | 'line' | 'arrow' | 'star' | 'triangle' | 'path' | 'polygon'

  x: number
  y: number
  width?: number
  height?: number
  rotation?: number
  scaleX?: number
  scaleY?: number

  // style
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  shadowColor?: string
  shadowBlur?: number
  cornerRadius?: number

  // text-specific
  text?: string
  fontSize?: number
  fontFamily?: string
  fontStyle?: string  
  align?: string      
  lineHeight?: number
  letterSpacing?: number

  src?: string       

  points?: number[]
  lineCap?: 'butt' | 'round' | 'square'
  lineJoin?: 'bevel' | 'round' | 'miter'

  numPoints?: number
  innerRadius?: number
  outerRadius?: number

  numSides?: number

  shadowOffsetX?: number
  shadowOffsetY?: number

  dash?: number[]

  data?: string

  zIndex?: number

  locked?: boolean
  visible?: boolean
  name?: string
}

export interface Page {
  id: string
  name: string
  elements: CanvasElement[]
  background: string   
  width: number
  height: number
}

export interface HistoryEntry {
  pages: Page[]
  currentPageIndex: number
}

export interface EditorState {
  documentName: string
  documentType: DocumentType
  pages: Page[]
  currentPageIndex: number
  selectedId: string | null
  activeTool: Tool
  history: Page[][]
  historyIndex: number
  zoom: number
}
