import { useRef, useState, useEffect } from 'react'
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
  onClick: () => void
  onDelete: () => void
}

function PageThumb({ page, index, isCover, isCurrent, onClick, onDelete }: PageThumbProps) {
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
          style={{ width: baseW, height: H }}
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

        {/* Delete button — overlay on hover (non-cover pages) */}
        {!isCover && (
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

export default function PagesPanel() {
  const { state, setCurrentPage, addPage, dispatch, reorderPages } = useEditor()
  const { pages, currentPageIndex } = state
  const scrollRef = useRef<HTMLDivElement>(null)

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

  return (
    <div
      className="h-[108px] bg-white border-t border-stone-100 flex items-center shrink-0 relative z-10 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
      style={{ minHeight: '108px', maxHeight: '108px' }}
    >
      {/* Scrollable pages list */}
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
                onClick={() => setCurrentPage(i)}
                onDelete={() => handleDelete(page.id)}
              />
            ))}
          </SortableContext>
        </div>
      </DndContext>

      {/* Separator */}
      <div className="h-14 w-px bg-stone-100 shrink-0" />

      {/* Add page button */}
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
    </div>
  )
}
