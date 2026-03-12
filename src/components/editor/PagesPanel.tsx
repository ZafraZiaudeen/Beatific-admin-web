import { useRef, useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Stage, Layer, Rect, Ellipse, RegularPolygon, Star, Text, Image as KonvaImage, Line, Arrow, Path } from 'react-konva'
import { useEditor } from '../../context/useEditor'
import { contentApi } from '../../api/apiClient'
import type { Page, CanvasElement } from '../../types/editor'

function ThumbnailElement({ el }: { el: CanvasElement }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)

  useEffect(() => {
    if (el.type === 'image' && el.src) {
      const image = new window.Image()
      image.crossOrigin = 'anonymous'
      image.src = el.src
      image.onload = () => setImg(image)
    }
  }, [el.src, el.type])

  const common = {
    x: el.x,
    y: el.y,
    rotation: el.rotation ?? 0,
    opacity: el.opacity ?? 1,
    visible: el.visible !== false,
  }

  switch (el.type) {
    case 'rect':
      return <Rect {...common} width={el.width ?? 100} height={el.height ?? 100} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} cornerRadius={el.cornerRadius} />
    case 'circle':
      return <Ellipse {...common} radiusX={(el.width ?? 100) / 2} radiusY={(el.height ?? 100) / 2} offsetX={-(el.width ?? 100) / 2} offsetY={-(el.height ?? 100) / 2} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />
    case 'triangle':
      return <RegularPolygon {...common} sides={3} radius={(el.width ?? 100) / 2} offsetX={-(el.width ?? 100) / 2} offsetY={-(el.height ?? 100) / 2} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />
    case 'polygon':
      return <RegularPolygon {...common} sides={el.numSides ?? el.numPoints ?? 6} radius={(el.width ?? 100) / 2} offsetX={-(el.width ?? 100) / 2} offsetY={-(el.height ?? 100) / 2} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />
    case 'star':
      return <Star {...common} numPoints={el.numPoints ?? 5} innerRadius={el.innerRadius ?? 25} outerRadius={el.outerRadius ?? 50} fill={el.fill} stroke={el.stroke} strokeWidth={el.strokeWidth} />
    case 'text':
      return <Text {...common} text={el.text} fontSize={el.fontSize} fontFamily={el.fontFamily} fontStyle={el.fontStyle} align={el.align} fill={el.fill} width={el.width} lineHeight={el.lineHeight} letterSpacing={el.letterSpacing} />
    case 'image':
      return img ? <KonvaImage {...common} image={img} width={el.width ?? img.naturalWidth} height={el.height ?? img.naturalHeight} /> : null
    case 'line':
      return <Line {...common} points={el.points ?? [0,0,10,10]} stroke={el.stroke} strokeWidth={el.strokeWidth} lineCap={el.lineCap} lineJoin={el.lineJoin} />
    case 'arrow':
      return <Arrow {...common} points={el.points ?? [0,0,10,10]} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill} lineCap={el.lineCap} lineJoin={el.lineJoin} pointerLength={10} pointerWidth={8} />
    case 'path':
      return <Path {...common} data={el.data} stroke={el.stroke} strokeWidth={el.strokeWidth} fill={el.fill} lineCap='round' lineJoin='round' />
    default:
      return null
  }
}

interface PageThumbProps {
  page: Page
  index: number
  isCover: boolean
  isCurrent: boolean
  canDelete: boolean
  onClick: () => void
  onDelete: () => void
}

function PageThumb({ page, index, isCover, isCurrent, canDelete, onClick, onDelete }: PageThumbProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: page.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const baseW = 62
  const scale = baseW / page.width
  const H = Math.round(page.height * scale)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`
        flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group select-none
        transition-colors duration-150
      `}
    >
      {/* Thumbnail frame */}
      <div className="relative">
        <div
          className={`
            rounded-md overflow-hidden bg-white transition-all duration-200
            ${isCurrent
              ? 'ring-2 ring-sky-500 shadow-md shadow-sky-100'
              : 'ring-1 ring-stone-200 shadow-sm group-hover:ring-sky-300 group-hover:shadow-md'
            }
          `}
          style={{ width: baseW, height: H, pointerEvents: 'none' }}
        >
          <Stage width={baseW} height={H} scaleX={scale} scaleY={scale}>
            <Layer>
              <Rect x={0} y={0} width={page.width} height={page.height} fill={page.background} listening={false} />
              {page.elements.map(el => <ThumbnailElement key={el.id} el={el} />)}
            </Layer>
          </Stage>
        </div>

        {/* Page number badge */}
        <div
          className={`
            absolute bottom-1 left-1 min-w-[16px] h-4 px-1 rounded
            flex items-center justify-center text-[9px] font-bold leading-none
            transition-colors duration-150
            ${isCurrent
              ? 'bg-sky-500 text-white'
              : 'bg-black/30 text-white group-hover:bg-black/50'
            }
          `}
        >
          {index + 1}
        </div>

        {/* Delete button — overlay on hover (all pages when more than one exists) */}
        {canDelete && (
          <button
            onClick={e => { e.stopPropagation(); onDelete() }}
            onPointerDown={e => e.stopPropagation()}
            title="Delete page"
            className="
              absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full
              bg-rose-500 text-white flex items-center justify-center
              text-[10px] leading-none font-bold
              opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100
              transition-all duration-150 shadow-sm
            "
          >
            ×
          </button>
        )}
      </div>

      {/* Page label */}
      <span
        className={`
          text-[10px] font-medium leading-none truncate max-w-[62px] text-center transition-colors
          ${isCurrent ? 'text-sky-600' : 'text-stone-400 group-hover:text-stone-600'}
        `}
      >
        {isCover ? 'Cover' : page.name}
      </span>
    </div>
  )
}

export default function PagesPanel({ singlePageMode }: { singlePageMode?: boolean }) {
  const { state, setCurrentPage, addPage, dispatch, reorderPages, loadPages } = useEditor()
  const { pages, currentPageIndex } = state
  const scrollRef = useRef<HTMLDivElement>(null)

  // Tab state — 'pages' = normal pages list, 'library' = browse single pages to insert
  const [activeTab, setActiveTab] = useState<'pages' | 'library'>('pages')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDelete = (pageId: string) => {
    if (pages.length <= 1) return
    dispatch({ type: 'DELETE_PAGE', pageId })
  }

  const handleAdd = () => {
    addPage()
    setTimeout(() => {
      scrollRef.current?.scrollTo({ left: 99999, behavior: 'smooth' })
    }, 50)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const activeIndex = pages.findIndex(p => p.id === active.id)
      const overIndex = pages.findIndex(p => p.id === over.id)
      reorderPages(activeIndex, overIndex)
    }
  }

  // Don't show the library tab when in single page mode (pages editor)
  const showLibraryTab = !singlePageMode

  return (
    <div className="bg-white border-t border-stone-100 shrink-0 relative z-10 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]">
      {/* Tab bar (only shown when library is available) */}
      {showLibraryTab && (
        <div className="flex items-center border-b border-stone-100 px-4">
          <button
            onClick={() => setActiveTab('pages')}
            className={`px-3 py-1.5 text-[11px] font-semibold border-b-2 transition-colors ${
              activeTab === 'pages'
                ? 'border-stone-900 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            Pages
          </button>
          <button
            onClick={() => setActiveTab('library')}
            className={`px-3 py-1.5 text-[11px] font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-sky-500 text-sky-700'
                : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            Page Library
          </button>
        </div>
      )}

      {/* Pages tab */}
      {activeTab === 'pages' && (
        <div
          className="h-[108px] flex items-center"
          style={{ minHeight: '108px', maxHeight: '108px' }}
        >
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <div
              ref={scrollRef}
              className="flex items-center gap-2.5 flex-1 h-full overflow-x-auto px-4 py-3"
              style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
            >
              <SortableContext items={pages.map(p => p.id)} strategy={horizontalListSortingStrategy}>
                {pages.map((page, i) => (
                  <PageThumb
                    key={page.id}
                    page={page}
                    index={i}
                    isCover={i === 0}
                    isCurrent={i === currentPageIndex}
                    canDelete={!singlePageMode && pages.length > 1}
                    onClick={() => setCurrentPage(i)}
                    onDelete={() => handleDelete(page.id)}
                  />
                ))}
              </SortableContext>
            </div>
          </DndContext>

          {!singlePageMode && (
            <>
              <div className="h-14 w-px bg-stone-100 shrink-0" />
              <div className="px-3 shrink-0 flex flex-col items-center gap-1">
                <button
                  onClick={handleAdd}
                  title="Add page"
                  className="
                    w-[62px] h-[74px] rounded-md border-2 border-dashed border-stone-200
                    flex flex-col items-center justify-center gap-1
                    text-stone-300 hover:border-sky-400 hover:text-sky-500 hover:bg-sky-50/50
                    transition-all duration-200 group
                  "
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="transition-transform duration-200 group-hover:scale-110">
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                </button>
                <span className="text-[10px] text-stone-400 font-medium leading-none">Add</span>
              </div>
            </>
          )}
        </div>
      )}

      {/* Library tab — browse and insert published single pages */}
      {activeTab === 'library' && (
        <PageLibraryPanel
          onInsert={(importedPages) => {
            loadPages(importedPages)
            setActiveTab('pages')
          }}
        />
      )}
    </div>
  )
}

/* ─── Page Library Panel ────────────────────────────────── */
interface LibraryItem {
  _id: string
  name: string
  pages: Page[]
  isPublished: boolean
  category?: string
}

function PageLibraryPanel({ onInsert }: { onInsert: (pages: Page[]) => void }) {
  const [items, setItems] = useState<LibraryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [inserting, setInserting] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (q?: string) => {
    setLoading(true)
    try {
      const res = await contentApi.list({ itemType: 'page', search: q })
      const data = (res.data ?? []) as LibraryItem[]
      // Only show published pages
      setItems(data.filter(d => d.isPublished))
    } catch {
      /* silent */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { void load() }, [load])

  const handleInsert = (item: LibraryItem) => {
    if (!item.pages?.length) return
    setInserting(item._id)
    // Take the first (and only) page from the single-page item
    // Generate new IDs so it doesn't conflict with existing pages
    const pagesToInsert: Page[] = item.pages.map(p => ({
      ...p,
      id: crypto.randomUUID(),
      name: item.name,
      elements: p.elements.map(el => ({ ...el, id: crypto.randomUUID() })),
    }))
    onInsert(pagesToInsert)
    setInserting(null)
  }

  return (
    <div
      className="h-[140px] flex flex-col"
      style={{ minHeight: '140px', maxHeight: '140px' }}
    >
      {/* Search bar */}
      <div className="flex items-center gap-2 px-4 py-1.5 shrink-0">
        <div className="relative flex-1 max-w-xs">
          <svg
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            className="absolute left-2 top-1/2 -translate-y-1/2 text-stone-400"
          >
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); load(e.target.value || undefined) }}
            placeholder="Search pages…"
            className="w-full pl-7 pr-2 py-1 text-[11px] border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-300"
          />
        </div>
        <span className="text-[10px] text-stone-400 shrink-0">
          {items.length} page{items.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        </div>
      ) : items.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-xs text-stone-400">
          No published pages found
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex-1 overflow-x-auto flex items-start gap-2 px-4 pb-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
        >
          {items.map(item => {
            const firstPage = item.pages[0]
            if (!firstPage) return null
            const baseW = 58
            const scale = baseW / firstPage.width
            const H = Math.round(firstPage.height * scale)
            return (
              <div
                key={item._id}
                onClick={() => handleInsert(item)}
                className="flex-shrink-0 flex flex-col items-center gap-1 cursor-pointer group select-none"
                title={`Insert "${item.name}"`}
              >
                <div className="relative">
                  <div
                    className={`rounded-md overflow-hidden bg-white transition-all duration-200 ring-1 ring-stone-200 shadow-sm group-hover:ring-sky-400 group-hover:shadow-md ${
                      inserting === item._id ? 'ring-2 ring-sky-500 scale-95' : ''
                    }`}
                    style={{ width: baseW, height: Math.min(H, 80), pointerEvents: 'none' }}
                  >
                    <Stage width={baseW} height={Math.min(H, 80)} scaleX={scale} scaleY={scale}>
                      <Layer>
                        <Rect x={0} y={0} width={firstPage.width} height={firstPage.height} fill={firstPage.background} listening={false} />
                        {firstPage.elements.map(el => <ThumbnailElement key={el.id} el={el} />)}
                      </Layer>
                    </Stage>
                  </div>
                  {/* Insert badge */}
                  <div className="absolute inset-0 rounded-md flex items-center justify-center bg-sky-500/0 group-hover:bg-sky-500/20 transition-colors">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-sky-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-sm">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </div>
                  </div>
                </div>
                <span className="text-[9px] font-medium text-stone-400 group-hover:text-sky-600 truncate max-w-[58px] text-center transition-colors leading-none">
                  {item.name}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
