import React, { useCallback, useEffect, useRef, useState } from 'react'
import Konva from 'konva'
import {
  Stage,
  Layer,
  Rect,
  Ellipse,
  Text,
  Image as KonvaImage,
  Line,
  Arrow,
  Star,
  RegularPolygon,
  Path,
  Transformer,
} from 'react-konva'
import { v4 as uuidv4 } from 'uuid'
import { useEditor } from '../../context/useEditor'
import type { CanvasElement, Tool } from '../../types/editor'

function getCursor(tool: Tool, isPanning: boolean): string {
  switch (tool) {
    case 'pan':      return isPanning ? 'grabbing' : 'grab'
    case 'text':     return 'text'
    case 'rect':
    case 'circle':
    case 'triangle':
    case 'hexagon':
    case 'pentagon':
    case 'diamond':
    case 'star':
    case 'line':
    case 'arrow':
    case 'pen':      return 'crosshair'
    case 'image':    return 'copy'
    default:         return 'default'
  }
}

interface ElementProps {
  el: CanvasElement
  isSelected: boolean
  onSelect: () => void
  onChange: (changes: Partial<CanvasElement>) => void
  stageScale: number
}

function KonvaElement({ el, onSelect, onChange }: ElementProps) {
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
    id: el.id,
    x: el.x,
    y: el.y,
    rotation: el.rotation ?? 0,
    opacity: el.opacity ?? 1,
    draggable: !el.locked,
    visible: el.visible !== false,
    shadowColor: el.shadowColor,
    shadowBlur: el.shadowBlur,
    shadowOffsetX: el.shadowOffsetX,
    shadowOffsetY: el.shadowOffsetY,
    onClick: onSelect,
    onTap: onSelect,
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) =>
      onChange({ x: e.target.x(), y: e.target.y() }),
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const node = e.target
      const scaleX = node.scaleX()
      const scaleY = node.scaleY()
      node.scaleX(1)
      node.scaleY(1)
      onChange({
        x: node.x(),
        y: node.y(),
        rotation: node.rotation(),
        width:  Math.max(5, (el.width  ?? 100) * scaleX),
        height: Math.max(5, (el.height ?? 100) * scaleY),
      })
    },
  }

  switch (el.type) {
    case 'rect':
      return (
        <Rect
          {...common}
          width={el.width ?? 100}
          height={el.height ?? 100}
          fill={el.fill ?? '#cccccc'}
          stroke={el.stroke ?? ''}
          strokeWidth={el.strokeWidth ?? 0}
          cornerRadius={el.cornerRadius ?? 0}
        />
      )

    case 'circle':
      return (
        <Ellipse
          {...common}
          radiusX={(el.width ?? 100) / 2}
          radiusY={(el.height ?? 100) / 2}
          offsetX={-(el.width ?? 100) / 2}
          offsetY={-(el.height ?? 100) / 2}
          fill={el.fill ?? '#cccccc'}
          stroke={el.stroke ?? ''}
          strokeWidth={el.strokeWidth ?? 0}
        />
      )

    case 'triangle':
      return (
        <RegularPolygon
          {...common}
          sides={3}
          radius={(el.width ?? 100) / 2}
          offsetX={-(el.width ?? 100) / 2}
          offsetY={-(el.height ?? 100) / 2}
          fill={el.fill ?? '#cccccc'}
          stroke={el.stroke ?? ''}
          strokeWidth={el.strokeWidth ?? 0}
        />
      )

    case 'polygon':
      return (
        <RegularPolygon
          {...common}
          sides={el.numSides ?? el.numPoints ?? 6}
          radius={(el.width ?? 100) / 2}
          offsetX={-(el.width ?? 100) / 2}
          offsetY={-(el.height ?? 100) / 2}
          fill={el.fill ?? '#94a3b8'}
          stroke={el.stroke ?? ''}
          strokeWidth={el.strokeWidth ?? 0}
        />
      )

    case 'star':
      return (
        <Star
          {...common}
          numPoints={el.numPoints ?? 5}
          innerRadius={el.innerRadius ?? 25}
          outerRadius={el.outerRadius ?? 50}
          fill={el.fill ?? '#ffcc00'}
          stroke={el.stroke ?? ''}
          strokeWidth={el.strokeWidth ?? 0}
        />
      )

    case 'text': {
      return (
        <Text
          {...common}
          text={el.text ?? 'Text'}
          fontSize={el.fontSize ?? 18}
          fontFamily={el.fontFamily ?? 'Arial'}
          fontStyle={el.fontStyle ?? 'normal'}
          align={el.align ?? 'left'}
          fill={el.fill ?? '#000000'}
          width={el.width}
          lineHeight={el.lineHeight ?? 1.2}
          letterSpacing={el.letterSpacing ?? 0}
        />
      )
    }

    case 'image':
      return img ? (
        <KonvaImage
          {...common}
          image={img}
          width={el.width ?? img.naturalWidth}
          height={el.height ?? img.naturalHeight}
        />
      ) : null

    case 'line':
      return (
        <Line
          {...common}
          points={el.points ?? [0, 0, 100, 0]}
          stroke={el.stroke ?? '#000000'}
          strokeWidth={el.strokeWidth ?? 2}
          lineCap={el.lineCap ?? 'round'}
          lineJoin={el.lineJoin ?? 'round'}
          fill={undefined}
        />
      )

    case 'arrow':
      return (
        <Arrow
          {...common}
          points={el.points ?? [0, 0, 100, 0]}
          stroke={el.stroke ?? '#000000'}
          strokeWidth={el.strokeWidth ?? 2}
          fill={el.fill ?? '#000000'}
          lineCap={el.lineCap ?? 'round'}
          lineJoin={el.lineJoin ?? 'round'}
          pointerLength={10}
          pointerWidth={8}
        />
      )

    case 'path':
      return (
        <Path
          {...common}
          data={el.data ?? ''}
          stroke={el.stroke ?? '#000000'}
          strokeWidth={el.strokeWidth ?? 2}
          fill={el.fill ? el.fill : undefined}
          lineCap='round'
          lineJoin='round'
        />
      )

    default:
      return null
  }
}

export default function KonvaEditor() {
  const {
    state,
    currentPage,
    select,
    addElement,
    updateElement,
    stageRef,
  } = useEditor()

  const { activeTool, zoom } = state

  const layerRef       = useRef<Konva.Layer>(null)
  const transformerRef = useRef<Konva.Transformer>(null)
  const drawingRef     = useRef<{ id: string; startX: number; startY: number; points?: number[] } | null>(null)
  const penPathRef     = useRef<string>('')
  const panRef         = useRef<{ startX: number; startY: number; scrollLeft: number; scrollTop: number } | null>(null)
  const [isPanning, setIsPanning] = useState(false)

  const getScrollParent = useCallback(() => {
    let el: HTMLElement | null = (stageRef.current as Konva.Stage)?.container()
    while (el) {
      const { overflow, overflowX, overflowY } = window.getComputedStyle(el)
      if (/auto|scroll/.test(overflow + overflowX + overflowY)) return el
      el = el.parentElement
    }
    return null
  }, [stageRef])

  useEffect(() => {
    const tr = transformerRef.current
    if (!tr) return
    const stage = stageRef.current as Konva.Stage | null
    if (!stage) return

    if (state.selectedId) {
      const node = stage.findOne(`#${state.selectedId}`)
      if (node) {
        tr.nodes([node])
        tr.getLayer()?.batchDraw()
        return
      }
    }
    tr.nodes([])
    tr.getLayer()?.batchDraw()
  }, [state.selectedId, stageRef])

  const getPos = useCallback(() => {
    const stage = stageRef.current as Konva.Stage
    const pos   = stage.getPointerPosition()
    if (!pos) return { x: 0, y: 0 }
    return { x: pos.x / zoom, y: pos.y / zoom }
  }, [stageRef, zoom])

  const handleMouseDown = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'pan') {
        const scroller = getScrollParent()
        panRef.current = {
          startX: e.evt.clientX,
          startY: e.evt.clientY,
          scrollLeft: scroller?.scrollLeft ?? 0,
          scrollTop:  scroller?.scrollTop  ?? 0,
        }
        setIsPanning(true)
        return
      }

      if (activeTool === 'select') {
        if (e.target === (stageRef.current as Konva.Stage)) select(null)
        return
      }

      const { x, y } = getPos()

      if (activeTool === 'text') {
        const id = uuidv4()
        addElement({
          id, type: 'text', x, y, text: 'Double-click to edit',
          fontSize: 18, fontFamily: 'Arial', fill: '#1a1a1a', fontStyle: 'normal',
          opacity: 1,
        })
        return
      }

      if (activeTool === 'image') return  

      if (activeTool === 'pen') {
        const id = uuidv4()
        penPathRef.current = `M ${x} ${y}`
        addElement({ id, type: 'path', x: 0, y: 0, data: penPathRef.current, stroke: '#1a1a1a', strokeWidth: 2, opacity: 1 })
        drawingRef.current = { id, startX: x, startY: y }
        return
      }

      const id = uuidv4()
      drawingRef.current = { id, startX: x, startY: y }

      if (activeTool === 'rect') {
        addElement({ id, type: 'rect', x, y, width: 1, height: 1, fill: '#94a3b8', opacity: 1 })
      } else if (activeTool === 'circle') {
        addElement({ id, type: 'circle', x, y, width: 1, height: 1, fill: '#94a3b8', opacity: 1 })
      } else if (activeTool === 'triangle') {
        addElement({ id, type: 'triangle', x, y, width: 1, height: 1, fill: '#94a3b8', opacity: 1 })
      } else if (activeTool === 'star') {
        addElement({ id, type: 'star', x, y, outerRadius: 1, innerRadius: 0.5, numPoints: 5, fill: '#facc15', opacity: 1 })
      } else if (activeTool === 'hexagon') {
        addElement({ id, type: 'polygon', x, y, width: 1, height: 1, numSides: 6, numPoints: 6, fill: '#818cf8', opacity: 1 })
      } else if (activeTool === 'pentagon') {
        addElement({ id, type: 'polygon', x, y, width: 1, height: 1, numSides: 5, numPoints: 5, fill: '#34d399', opacity: 1 })
      } else if (activeTool === 'diamond') {
        addElement({ id, type: 'polygon', x, y, width: 1, height: 1, numSides: 4, numPoints: 4, fill: '#f472b6', opacity: 1 })
      } else if (activeTool === 'line') {
        addElement({ id, type: 'line', x: 0, y: 0, points: [x, y, x, y], stroke: '#1a1a1a', strokeWidth: 2, opacity: 1 })
      } else if (activeTool === 'arrow') {
        addElement({ id, type: 'arrow', x: 0, y: 0, points: [x, y, x, y], stroke: '#1a1a1a', strokeWidth: 2, fill: '#1a1a1a', opacity: 1 })
      }
    },
    [activeTool, addElement, select, stageRef, getPos, getScrollParent]
  )

  const handleMouseMove = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      if (activeTool === 'pan') {
        if (!panRef.current) return
        const scroller = getScrollParent()
        if (!scroller) return
        const dx = e.evt.clientX - panRef.current.startX
        const dy = e.evt.clientY - panRef.current.startY
        scroller.scrollLeft = panRef.current.scrollLeft - dx
        scroller.scrollTop  = panRef.current.scrollTop  - dy
        return
      }
      if (!drawingRef.current) return
      const { x, y } = getPos()
      const { id, startX, startY } = drawingRef.current

      if (activeTool === 'pen') {
        penPathRef.current += ` L ${x} ${y}`
        updateElement(id, { data: penPathRef.current })
        return
      }

      const w = x - startX
      const h = y - startY

      if (activeTool === 'rect' || activeTool === 'circle' || activeTool === 'triangle') {
        updateElement(id, {
          x: w < 0 ? x : startX,
          y: h < 0 ? y : startY,
          width: Math.abs(w),
          height: Math.abs(h),
        })
      } else if (activeTool === 'hexagon' || activeTool === 'pentagon' || activeTool === 'diamond') {
        const size = Math.max(Math.abs(w), Math.abs(h))
        updateElement(id, {
          x: w < 0 ? x : startX,
          y: h < 0 ? y : startY,
          width: size,
          height: size,
        })
      } else if (activeTool === 'star') {
        const r = Math.sqrt(w * w + h * h)
        updateElement(id, { x: startX, y: startY, outerRadius: r, innerRadius: r * 0.4 })
      } else if (activeTool === 'line' || activeTool === 'arrow') {
        updateElement(id, { points: [startX, startY, x, y] })
      }
    },
    [activeTool, updateElement, getPos, getScrollParent]
  )

  const handleMouseUp = useCallback(() => {
    drawingRef.current = null
    penPathRef.current = ''
    panRef.current = null
    setIsPanning(false)
  }, [])

  const handleDblClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const node = e.target as Konva.Node
      const el   = currentPage.elements.find(el => el.id === node.id())
      if (!el || el.type !== 'text') return

      node.hide()
      const stage    = stageRef.current as Konva.Stage
      const stageBox = stage.container().getBoundingClientRect()
      const absPos   = node.getAbsolutePosition()

      const textarea         = document.createElement('textarea')
      document.body.appendChild(textarea)
      textarea.value         = el.text ?? ''
      textarea.style.position = 'absolute'
      textarea.style.top     = `${stageBox.top + absPos.y * zoom}px`
      textarea.style.left    = `${stageBox.left + absPos.x * zoom}px`
      textarea.style.width   = `${((el.width ?? 200) * zoom) + 2}px`
      textarea.style.fontSize = `${(el.fontSize ?? 16) * zoom}px`
      textarea.style.fontFamily = el.fontFamily ?? 'Arial'
      textarea.style.fontStyle  = el.fontStyle ?? 'normal'
      textarea.style.color      = el.fill ?? '#000'
      textarea.style.border     = '1px dashed #0ea5e9'
      textarea.style.background = 'transparent'
      textarea.style.resize     = 'none'
      textarea.style.outline    = 'none'
      textarea.style.padding    = '0'
      textarea.style.lineHeight = String(el.lineHeight ?? 1.2)
      textarea.style.zIndex     = '9999'
      textarea.rows             = 3
      textarea.focus()
      textarea.select()

      const finish = () => {
        updateElement(el.id, { text: textarea.value })
        node.show()
        document.body.removeChild(textarea)
      }
      textarea.addEventListener('blur', finish)
      textarea.addEventListener('keydown', (ev: KeyboardEvent) => {
        if (ev.key === 'Escape') { ev.preventDefault(); finish() }
        if (ev.key === 'Enter' && !ev.shiftKey) { ev.preventDefault(); finish() }
      })
    },
    [currentPage, stageRef, updateElement, zoom]
  )

  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (activeTool === 'image') {
      fileInputRef.current?.click()
    }
  }, [activeTool])

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      const src = ev.target?.result as string
      const img = new window.Image()
      img.onload = () => {
        const maxDim = 400
        const scale  = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight))
        addElement({
          id: uuidv4(),
          type: 'image',
          x: 50, y: 50,
          width:  img.naturalWidth  * scale,
          height: img.naturalHeight * scale,
          src,
          opacity: 1,
        })
      }
      img.src = src
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        const active = document.activeElement
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA')) return
        if (state.selectedId) {
          // dispatch deleteElement from outside — done in EditorView with the hook
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.selectedId])

  const canvasW = currentPage.width
  const canvasH = currentPage.height

  return (
    <div
      className="relative select-none"
      style={{ cursor: getCursor(activeTool, isPanning), width: canvasW * zoom, height: canvasH * zoom }}
    >
      {/* Hidden file input for image import */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleImageFile}
      />

      <Stage
        ref={stageRef}
        width={canvasW * zoom}
        height={canvasH * zoom}
        scaleX={zoom}
        scaleY={zoom}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onDblClick={handleDblClick}
        style={{ display: 'block' }}
      >
        <Layer ref={layerRef}>
          {/* Background */}
          <Rect
            x={0} y={0}
            width={canvasW} height={canvasH}
            fill={currentPage.background}
            listening={false}
          />

          {/* Elements */}
          {currentPage.elements.map(el => (
            <KonvaElement
              key={el.id}
              el={el}
              isSelected={el.id === state.selectedId}
              onSelect={() => {
                if (activeTool === 'select') select(el.id)
              }}
              onChange={changes => updateElement(el.id, changes)}
              stageScale={zoom}
            />
          ))}

          {/* Transformer */}
          <Transformer
            ref={transformerRef}
            keepRatio={false}
            boundBoxFunc={(_oldBox, newBox) => {
              if (newBox.width < 5 || newBox.height < 5) return _oldBox
              return newBox
            }}
            anchorStroke='#0ea5e9'
            anchorFill='#ffffff'
            anchorSize={8}
            borderStroke='#0ea5e9'
            borderDash={[4, 2]}
          />
        </Layer>
      </Stage>
    </div>
  )
}
