import React from 'react'
import { useEditor } from '../context/useEditor'
import type { CanvasElement } from '../types/editor'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-medium text-stone-400 uppercase tracking-wide">{label}</label>
      {children}
    </div>
  )
}

function NumberInput({
  value, min, max, step = 1, onChange,
}: {
  value: number; min?: number; max?: number; step?: number
  onChange: (v: number) => void
}) {
  return (
    <input
      type="number" value={Math.round(value * 100) / 100}
      min={min} max={max} step={step}
      onChange={e => onChange(parseFloat(e.target.value) || 0)}
      className="w-full px-2 py-1 text-xs border border-stone-200 rounded bg-stone-50 focus:outline-none focus:ring-1 focus:ring-sky-300"
    />
  )
}

function toHex6(color: string): string {
  if (!color) return '#000000'
  if (/^#[0-9a-fA-F]{8}$/.test(color)) return color.slice(0, 7)
  if (/^#[0-9a-fA-F]{6}$/.test(color)) return color
  return '#000000'
}

function ColorInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color" value={toHex6(value)}
        onChange={e => onChange(e.target.value)}
        className="w-8 h-8 rounded border border-stone-200 cursor-pointer p-0.5"
      />
      <input
        type="text" value={value || ''}
        onChange={e => onChange(e.target.value)}
        className="flex-1 px-2 py-1 text-xs border border-stone-200 rounded bg-stone-50 font-mono uppercase focus:outline-none focus:ring-1 focus:ring-sky-300"
        placeholder="#000000 or transparent"
      />
    </div>
  )
}

export default function PropertiesPanel() {
  const {
    currentPage, selectedElement,
    updateElement, deleteSelected,
    setBackground, reorderElement,
    dispatch,
  } = useEditor()

  const el: CanvasElement | null = selectedElement

  const upd = (changes: Partial<CanvasElement>) => {
    if (!el) return
    updateElement(el.id, changes)
  }

  if (!el) {
    return (
      <div className="w-64 bg-white border-l border-stone-200 flex flex-col z-10 overflow-hidden">
        <div className="px-4 py-3 border-b border-stone-100 text-[10px] font-bold text-stone-400 uppercase tracking-widest">
          Page
        </div>
        <div className="p-4 space-y-4 overflow-y-auto flex-1">
          <Field label="Background">
            <ColorInput value={currentPage.background} onChange={setBackground} />
          </Field>
          <Field label="Page name">
            <input
              type="text"
              value={currentPage.name}
              onChange={e =>
                dispatch({ type: 'RENAME_PAGE', pageId: currentPage.id, name: e.target.value })
              }
              className="w-full px-2 py-1 text-xs border border-stone-200 rounded bg-stone-50 focus:outline-none focus:ring-1 focus:ring-sky-300"
            />
          </Field>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 bg-white border-l border-stone-200 flex flex-col z-10 overflow-hidden">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between">
        <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest capitalize">{el.type}</span>
        <button
          onClick={deleteSelected}
          className="text-[10px] text-stone-400 hover:text-rose-600 transition-colors px-1.5 py-0.5 rounded hover:bg-rose-50"
        >
          Delete
        </button>
      </div>

      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        <Field label="Position">
          <div className="grid grid-cols-2 gap-2">
            <div><span className="text-[9px] text-stone-400">X</span><NumberInput value={el.x} onChange={v => upd({ x: v })} /></div>
            <div><span className="text-[9px] text-stone-400">Y</span><NumberInput value={el.y} onChange={v => upd({ y: v })} /></div>
          </div>
        </Field>

        {el.width !== undefined && el.height !== undefined && (
          <Field label="Size">
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-[9px] text-stone-400">W</span><NumberInput value={el.width} min={1} onChange={v => upd({ width: v })} /></div>
              <div><span className="text-[9px] text-stone-400">H</span><NumberInput value={el.height} min={1} onChange={v => upd({ height: v })} /></div>
            </div>
          </Field>
        )}

        <Field label="Rotation">
          <NumberInput value={el.rotation ?? 0} min={-360} max={360} onChange={v => upd({ rotation: v })} />
        </Field>

        <Field label="Opacity">
          <div className="flex items-center gap-2">
            <input type="range" min={0} max={1} step={0.01} value={el.opacity ?? 1}
              onChange={e => upd({ opacity: parseFloat(e.target.value) })}
              className="flex-1 accent-sky-500" />
            <span className="text-xs text-stone-500 w-8 text-right">{Math.round((el.opacity ?? 1) * 100)}%</span>
          </div>
        </Field>

        {el.type !== 'image' && el.type !== 'line' && el.type !== 'arrow' && (
          <Field label="Fill"><ColorInput value={el.fill ?? '#cccccc'} onChange={v => upd({ fill: v })} /></Field>
        )}

        {el.type !== 'image' && el.type !== 'text' && (
          <>
            <Field label="Stroke"><ColorInput value={el.stroke ?? ''} onChange={v => upd({ stroke: v })} /></Field>
            <Field label="Stroke width"><NumberInput value={el.strokeWidth ?? 0} min={0} max={50} onChange={v => upd({ strokeWidth: v })} /></Field>
          </>
        )}

        {el.type === 'rect' && (
          <Field label="Corner radius"><NumberInput value={el.cornerRadius ?? 0} min={0} max={200} onChange={v => upd({ cornerRadius: v })} /></Field>
        )}

        {el.type === 'polygon' && (
          <Field label="Sides">
            <NumberInput value={el.numSides ?? el.numPoints ?? 6} min={3} max={20} onChange={v => upd({ numSides: v })} />
          </Field>
        )}

        {el.type === 'star' && (
          <>
            <Field label="Points"><NumberInput value={el.numPoints ?? 5} min={3} max={20} onChange={v => upd({ numPoints: v })} /></Field>
            <Field label="Inner radius"><NumberInput value={el.innerRadius ?? 25} min={1} max={500} onChange={v => upd({ innerRadius: v })} /></Field>
            <Field label="Outer radius"><NumberInput value={el.outerRadius ?? 50} min={1} max={500} onChange={v => upd({ outerRadius: v })} /></Field>
          </>
        )}

        {el.type === 'text' && (
          <>
            <Field label="Text color"><ColorInput value={el.fill ?? '#000000'} onChange={v => upd({ fill: v })} /></Field>
            <Field label="Font size"><NumberInput value={el.fontSize ?? 16} min={6} max={300} onChange={v => upd({ fontSize: v })} /></Field>
            <Field label="Font family">
              <select value={el.fontFamily ?? 'Arial'} onChange={e => upd({ fontFamily: e.target.value })}
                className="w-full px-2 py-1 text-xs border border-stone-200 rounded bg-stone-50 focus:outline-none focus:ring-1 focus:ring-sky-300">
                {['Arial','Helvetica','Georgia','Times New Roman','Courier New','Verdana','Trebuchet MS','Impact','Comic Sans MS'].map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </Field>
            <Field label="Style">
              <div className="flex gap-1">
                {(['normal','bold','italic','bold italic'] as const).map(s => (
                  <button key={s} onClick={() => upd({ fontStyle: s })}
                    className={`flex-1 py-1 text-[10px] rounded border transition-colors ${(el.fontStyle ?? 'normal') === s ? 'bg-sky-100 border-sky-300 text-sky-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Align">
              <div className="flex gap-1">
                {(['left','center','right'] as const).map(a => (
                  <button key={a} onClick={() => upd({ align: a })}
                    className={`flex-1 py-1 text-[10px] rounded border transition-colors ${(el.align ?? 'left') === a ? 'bg-sky-100 border-sky-300 text-sky-700' : 'border-stone-200 text-stone-500 hover:bg-stone-50'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Line height"><NumberInput value={el.lineHeight ?? 1.2} min={0.5} max={5} step={0.1} onChange={v => upd({ lineHeight: v })} /></Field>
          </>
        )}

        <Field label="Layer">
          <div className="grid grid-cols-4 gap-1">
            {(['top','up','down','bottom'] as const).map(d => (
              <button key={d} onClick={() => reorderElement(el.id, d)} title={d}
                className="py-1 text-[10px] rounded border border-stone-200 text-stone-500 hover:bg-stone-50 hover:text-stone-800 transition-colors">
                {d === 'top' ? '⬆⬆' : d === 'up' ? '⬆' : d === 'down' ? '⬇' : '⬇⬇'}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Visibility">
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
              <input type="checkbox" checked={el.visible !== false} onChange={e => upd({ visible: e.target.checked })} className="accent-sky-500" />
              Visible
            </label>
            <label className="flex items-center gap-1.5 text-xs text-stone-500 cursor-pointer">
              <input type="checkbox" checked={el.locked === true} onChange={e => upd({ locked: e.target.checked })} className="accent-sky-500" />
              Locked
            </label>
          </div>
        </Field>

        <Field label="Shadow">
          <div className="space-y-2">
            <ColorInput value={el.shadowColor ?? '#000000'} onChange={v => upd({ shadowColor: v })} />
            <div className="grid grid-cols-3 gap-1">
              <div>
                <span className="text-[9px] text-stone-400">Blur</span>
                <NumberInput value={el.shadowBlur ?? 0} min={0} max={100} onChange={v => upd({ shadowBlur: v })} />
              </div>
              <div>
                <span className="text-[9px] text-stone-400">X</span>
                <NumberInput value={el.shadowOffsetX ?? 0} min={-100} max={100} onChange={v => upd({ shadowOffsetX: v })} />
              </div>
              <div>
                <span className="text-[9px] text-stone-400">Y</span>
                <NumberInput value={el.shadowOffsetY ?? 0} min={-100} max={100} onChange={v => upd({ shadowOffsetY: v })} />
              </div>
            </div>
          </div>
        </Field>
      </div>
    </div>
  )
}
