import type { CanvasElement, Page } from '../types/editor'

// ─── JSON export ─────────────────────────────────────────────────────────────
export function exportAsJSON(
  pages: Page[],
  documentName: string,
  documentType: string
): string {
  const payload = {
    documentName,
    documentType,
    exportedAt: new Date().toISOString(),
    version: '1.0',
    pages: pages.map(p => ({
      id: p.id,
      name: p.name,
      width: p.width,
      height: p.height,
      background: p.background,
      elements: p.elements,
    })),
  }
  return JSON.stringify(payload, null, 2)
}

export function downloadJSON(
  pages: Page[],
  documentName: string,
  documentType: string
): void {
  const json = exportAsJSON(pages, documentName, documentType)
  const blob = new Blob([json], { type: 'application/json' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${documentName.replace(/\s+/g, '_')}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// ─── SVG export ───────────────────────────────────────────────────────────────
function elementToSVG(el: CanvasElement): string {
  const op  = el.opacity ?? 1
  const rot = el.rotation ?? 0
  const sw  = el.strokeWidth ?? 1
  const stroke = el.stroke ?? 'none'
  const fill   = el.fill ?? 'transparent'

  const transform = rot !== 0
    ? ` transform="rotate(${rot} ${(el.x ?? 0) + (el.width ?? 0) / 2} ${(el.y ?? 0) + (el.height ?? 0) / 2})"`
    : ''

  switch (el.type) {
    case 'rect':
      return `<rect x="${el.x}" y="${el.y}" width="${el.width ?? 100}" height="${el.height ?? 100}"
        fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"
        rx="${el.cornerRadius ?? 0}"${transform}/>`

    case 'circle':
      return `<ellipse cx="${(el.x ?? 0) + (el.width ?? 100) / 2}" cy="${(el.y ?? 0) + (el.height ?? 100) / 2}"
        rx="${(el.width ?? 100) / 2}" ry="${(el.height ?? 100) / 2}"
        fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"${transform}/>`

    case 'text': {
      const fs = el.fontSize ?? 16
      const ff = el.fontFamily ?? 'Arial'
      const fw = el.fontStyle?.includes('bold') ? 'bold' : 'normal'
      const fi = el.fontStyle?.includes('italic') ? 'italic' : 'normal'
      return `<text x="${el.x}" y="${(el.y ?? 0) + fs}"
        font-size="${fs}" font-family="${ff}" font-weight="${fw}" font-style="${fi}"
        fill="${fill}" opacity="${op}"${transform}>${escapeXML(el.text ?? '')}</text>`
    }

    case 'image':
      return `<image href="${el.src ?? ''}" x="${el.x}" y="${el.y}"
        width="${el.width ?? 100}" height="${el.height ?? 100}" opacity="${op}"${transform}/>`

    case 'line':
    case 'arrow': {
      const pts  = el.points ?? []
      const pStr = pts.map((v, i) => (i % 2 === 0 ? `${v},` : `${v} `)).join('').trim()
      return `<polyline points="${pStr}" fill="none" stroke="${stroke}" stroke-width="${sw}"
        opacity="${op}" stroke-linecap="${el.lineCap ?? 'round'}" stroke-linejoin="${el.lineJoin ?? 'round'}"/>`
    }

    case 'star': {
      const points = starPoints(
        (el.x ?? 0) + (el.outerRadius ?? 50),
        (el.y ?? 0) + (el.outerRadius ?? 50),
        el.numPoints ?? 5,
        el.outerRadius ?? 50,
        el.innerRadius ?? 25
      )
      return `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"${transform}/>`
    }

    case 'path':
      return `<path d="${el.data ?? ''}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${op}"/>`

    default:
      return ''
  }
}

function starPoints(
  cx: number, cy: number,
  numPoints: number, outerR: number, innerR: number
): string {
  const pts: string[] = []
  for (let i = 0; i < numPoints * 2; i++) {
    const angle = (Math.PI / numPoints) * i - Math.PI / 2
    const r     = i % 2 === 0 ? outerR : innerR
    pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`)
  }
  return pts.join(' ')
}

function escapeXML(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

export function pageToSVG(page: Page): string {
  const bg = page.background ?? '#ffffff'
  const els = page.elements
    .filter(e => e.visible !== false)
    .map(elementToSVG)
    .join('\n  ')

  return `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
     width="${page.width}" height="${page.height}" viewBox="0 0 ${page.width} ${page.height}">
  <rect width="${page.width}" height="${page.height}" fill="${bg}"/>
  ${els}
</svg>`
}

export function downloadSVG(page: Page, name: string): void {
  const svg  = pageToSVG(page)
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `${name.replace(/\s+/g, '_')}.svg`
  a.click()
  URL.revokeObjectURL(url)
}

export function downloadAllSVGs(pages: Page[], docName: string): void {
  pages.forEach((page, i) => {
    const name = `${docName}_${String(i + 1).padStart(2, '0')}_${page.name}`
    downloadSVG(page, name)
  })
}
