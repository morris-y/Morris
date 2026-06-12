'use client'

import { useCallback, useEffect, useRef, useState, type PointerEvent } from 'react'
import {
  Download,
  Eraser,
  ImagePlus,
  PaintBucket,
  Paintbrush,
  Pencil,
  Square,
  Trash2,
  Upload,
} from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

type PaintTool = 'brush' | 'eraser' | 'fill' | 'line' | 'rect'
type PatternId = 'solid' | 'dots' | 'checker' | 'hatch' | 'brick' | 'noise'

interface Point {
  x: number
  y: number
}

interface PatternSwatch {
  id: PatternId
  name: string
  css: string
}

const CANVAS_WIDTH = 720
const CANVAS_HEIGHT = 460

const PATTERNS: PatternSwatch[] = [
  { id: 'solid', name: 'Solid', css: '#111' },
  {
    id: 'dots',
    name: 'Dots',
    css: 'radial-gradient(circle, #111 0 2px, transparent 2.5px)',
  },
  {
    id: 'checker',
    name: 'Checker',
    css: 'linear-gradient(45deg, #111 25%, transparent 25% 75%, #111 75%), linear-gradient(45deg, #111 25%, transparent 25% 75%, #111 75%)',
  },
  {
    id: 'hatch',
    name: 'Hatch',
    css: 'repeating-linear-gradient(135deg, #111 0 2px, transparent 2px 8px)',
  },
  {
    id: 'brick',
    name: 'Brick',
    css: 'linear-gradient(#111 2px, transparent 2px), linear-gradient(90deg, #111 2px, transparent 2px)',
  },
  {
    id: 'noise',
    name: 'Static',
    css: 'radial-gradient(circle at 20% 20%, #111 0 1px, transparent 1px), radial-gradient(circle at 70% 60%, #111 0 1px, transparent 1px), radial-gradient(circle at 40% 80%, #111 0 1px, transparent 1px)',
  },
]

const COLORS = ['#111111', '#ffffff', '#e5484d', '#f59e0b', '#39a935', '#0ea5e9', '#7c3aed', '#ec4899']

function makePattern(ctx: CanvasRenderingContext2D, pattern: PatternId, color: string): CanvasPattern | string {
  if (pattern === 'solid') return color

  const tile = document.createElement('canvas')
  tile.width = 16
  tile.height = 16
  const t = tile.getContext('2d')
  if (!t) return color

  t.fillStyle = '#ffffff'
  t.fillRect(0, 0, tile.width, tile.height)
  t.fillStyle = color
  t.strokeStyle = color
  t.lineWidth = 2

  if (pattern === 'dots') {
    t.beginPath()
    t.arc(4, 4, 2, 0, Math.PI * 2)
    t.arc(12, 12, 2, 0, Math.PI * 2)
    t.fill()
  }

  if (pattern === 'checker') {
    t.fillRect(0, 0, 8, 8)
    t.fillRect(8, 8, 8, 8)
  }

  if (pattern === 'hatch') {
    for (let i = -16; i < 32; i += 8) {
      t.beginPath()
      t.moveTo(i, 16)
      t.lineTo(i + 16, 0)
      t.stroke()
    }
  }

  if (pattern === 'brick') {
    t.strokeRect(0, 0, 16, 8)
    t.strokeRect(-8, 8, 16, 8)
    t.strokeRect(8, 8, 16, 8)
  }

  if (pattern === 'noise') {
    for (let i = 0; i < 36; i++) {
      const v = Math.random() > 0.45 ? color : '#ffffff'
      t.fillStyle = v
      t.fillRect(Math.floor(Math.random() * 16), Math.floor(Math.random() * 16), 1, 1)
    }
  }

  return ctx.createPattern(tile, 'repeat') ?? color
}

function floodFill(ctx: CanvasRenderingContext2D, start: Point, fill: [number, number, number, number]) {
  const image = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  const data = image.data
  const x = Math.floor(start.x)
  const y = Math.floor(start.y)
  if (x < 0 || x >= CANVAS_WIDTH || y < 0 || y >= CANVAS_HEIGHT) return

  const idx = (y * CANVAS_WIDTH + x) * 4
  const target: [number, number, number, number] = [data[idx], data[idx + 1], data[idx + 2], data[idx + 3]]
  if (target.every((v, i) => v === fill[i])) return

  const matches = (px: number) =>
    data[px] === target[0] &&
    data[px + 1] === target[1] &&
    data[px + 2] === target[2] &&
    data[px + 3] === target[3]

  const stack: Point[] = [{ x, y }]
  while (stack.length) {
    const point = stack.pop()
    if (!point) continue
    if (point.x < 0 || point.x >= CANVAS_WIDTH || point.y < 0 || point.y >= CANVAS_HEIGHT) continue

    const p = (point.y * CANVAS_WIDTH + point.x) * 4
    if (!matches(p)) continue

    data[p] = fill[0]
    data[p + 1] = fill[1]
    data[p + 2] = fill[2]
    data[p + 3] = fill[3]

    stack.push({ x: point.x + 1, y: point.y })
    stack.push({ x: point.x - 1, y: point.y })
    stack.push({ x: point.x, y: point.y + 1 })
    stack.push({ x: point.x, y: point.y - 1 })
  }

  ctx.putImageData(image, 0, 0)
}

function hexToRgba(hex: string): [number, number, number, number] {
  const clean = hex.replace('#', '')
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
    255,
  ]
}

export function MacPaintApp(_props: AppWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const drawingRef = useRef(false)
  const lastPointRef = useRef<Point | null>(null)
  const startPointRef = useRef<Point | null>(null)
  const snapshotRef = useRef<ImageData | null>(null)

  const [tool, setTool] = useState<PaintTool>('brush')
  const [pattern, setPattern] = useState<PatternId>('solid')
  const [color, setColor] = useState('#111111')
  const [size, setSize] = useState(8)

  const getContext = useCallback(() => canvasRef.current?.getContext('2d', { willReadFrequently: true }) ?? null, [])

  const getPoint = useCallback((event: PointerEvent<HTMLCanvasElement>): Point => {
    const rect = event.currentTarget.getBoundingClientRect()
    return {
      x: ((event.clientX - rect.left) / rect.width) * CANVAS_WIDTH,
      y: ((event.clientY - rect.top) / rect.height) * CANVAS_HEIGHT,
    }
  }, [])

  const primeCanvas = useCallback(() => {
    const ctx = getContext()
    if (!ctx) return
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
  }, [getContext])

  useEffect(() => {
    primeCanvas()
  }, [primeCanvas])

  const strokeTo = useCallback(
    (point: Point) => {
      const ctx = getContext()
      const last = lastPointRef.current
      if (!ctx || !last) return

      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.lineWidth = size
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : makePattern(ctx, pattern, color)
      ctx.beginPath()
      ctx.moveTo(last.x, last.y)
      ctx.lineTo(point.x, point.y)
      ctx.stroke()
      lastPointRef.current = point
    },
    [color, getContext, pattern, size, tool],
  )

  const drawShapePreview = useCallback(
    (point: Point, commit = false) => {
      const ctx = getContext()
      const start = startPointRef.current
      const snapshot = snapshotRef.current
      if (!ctx || !start || !snapshot) return

      ctx.putImageData(snapshot, 0, 0)
      ctx.lineCap = 'square'
      ctx.lineJoin = 'miter'
      ctx.lineWidth = size
      ctx.strokeStyle = tool === 'eraser' ? '#ffffff' : color
      ctx.fillStyle = makePattern(ctx, pattern, color)

      if (tool === 'line') {
        ctx.beginPath()
        ctx.moveTo(start.x, start.y)
        ctx.lineTo(point.x, point.y)
        ctx.stroke()
      }

      if (tool === 'rect') {
        const x = Math.min(start.x, point.x)
        const y = Math.min(start.y, point.y)
        const w = Math.abs(point.x - start.x)
        const h = Math.abs(point.y - start.y)
        ctx.fillRect(x, y, w, h)
        ctx.strokeRect(x, y, w, h)
      }

      if (commit) snapshotRef.current = null
    },
    [color, getContext, pattern, size, tool],
  )

  const handlePointerDown = (event: PointerEvent<HTMLCanvasElement>) => {
    const ctx = getContext()
    if (!ctx) return

    const point = getPoint(event)
    event.currentTarget.setPointerCapture(event.pointerId)

    if (tool === 'fill') {
      floodFill(ctx, point, hexToRgba(color))
      return
    }

    drawingRef.current = true
    lastPointRef.current = point
    startPointRef.current = point

    if (tool === 'line' || tool === 'rect') {
      snapshotRef.current = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
      return
    }

    ctx.fillStyle = tool === 'eraser' ? '#ffffff' : makePattern(ctx, pattern, color)
    ctx.beginPath()
    ctx.arc(point.x, point.y, size / 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const handlePointerMove = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const point = getPoint(event)
    if (tool === 'line' || tool === 'rect') {
      drawShapePreview(point)
      return
    }
    strokeTo(point)
  }

  const handlePointerUp = (event: PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return
    const point = getPoint(event)
    if (tool === 'line' || tool === 'rect') drawShapePreview(point, true)
    drawingRef.current = false
    lastPointRef.current = null
    startPointRef.current = null
  }

  const exportPng = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `macpaint-${Date.now()}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  const importPng = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const ctx = getContext()
        if (!ctx) return
        ctx.fillStyle = '#ffffff'
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)
        const scale = Math.min(CANVAS_WIDTH / img.width, CANVAS_HEIGHT / img.height)
        const width = img.width * scale
        const height = img.height * scale
        ctx.drawImage(img, (CANVAS_WIDTH - width) / 2, (CANVAS_HEIGHT - height) / 2, width, height)
      }
      img.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  }

  const toolButtons: Array<{ id: PaintTool; label: string; Icon: typeof Pencil }> = [
    { id: 'brush', label: 'Brush', Icon: Paintbrush },
    { id: 'eraser', label: 'Eraser', Icon: Eraser },
    { id: 'fill', label: 'Fill', Icon: PaintBucket },
    { id: 'line', label: 'Line', Icon: Pencil },
    { id: 'rect', label: 'Rect', Icon: Square },
  ]

  return (
    <div className="flex h-full min-h-0 w-full bg-[#d8d3c3] text-[#1b1a17]">
      <aside className="flex w-24 shrink-0 flex-col gap-3 border-r border-black/30 bg-[#bfb9aa] p-3 shadow-[inset_-1px_0_0_rgba(255,255,255,0.45)]">
        <div className="grid grid-cols-2 gap-1">
          {toolButtons.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              aria-label={label}
              title={label}
              onClick={() => setTool(id)}
              className={`flex aspect-square items-center justify-center border text-xs shadow-[inset_1px_1px_0_rgba(255,255,255,0.75)] ${
                tool === id
                  ? 'border-black bg-[#1b1a17] text-white'
                  : 'border-black/50 bg-[#e6e0cf] text-[#1b1a17] hover:bg-white'
              }`}
            >
              <Icon className="h-4 w-4" />
            </button>
          ))}
        </div>

        <label className="space-y-1 text-[10px] font-bold uppercase tracking-[0.08em]">
          Size
          <input
            value={size}
            min={1}
            max={32}
            type="range"
            onChange={(event) => setSize(Number(event.target.value))}
            className="w-full accent-black"
          />
        </label>

        <div className="grid grid-cols-2 gap-1">
          {COLORS.map((swatch) => (
            <button
              key={swatch}
              type="button"
              aria-label={swatch}
              title={swatch}
              onClick={() => setColor(swatch)}
              className={`aspect-square border shadow-[inset_1px_1px_0_rgba(255,255,255,0.5)] ${
                color === swatch ? 'border-black ring-2 ring-black/40' : 'border-black/40'
              }`}
              style={{ background: swatch }}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-1">
          {PATTERNS.map((swatch) => (
            <button
              key={swatch.id}
              type="button"
              title={swatch.name}
              aria-label={swatch.name}
              onClick={() => setPattern(swatch.id)}
              className={`aspect-square border bg-white bg-[length:12px_12px] ${
                pattern === swatch.id ? 'border-black ring-2 ring-black/40' : 'border-black/40'
              }`}
              style={{ backgroundImage: swatch.id === 'solid' ? undefined : swatch.css }}
            />
          ))}
        </div>

        <div className="mt-auto grid grid-cols-2 gap-1">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(event) => importPng(event.target.files?.[0])}
          />
          <button
            type="button"
            title="Import PNG"
            aria-label="Import PNG"
            onClick={() => fileRef.current?.click()}
            className="flex aspect-square items-center justify-center border border-black/50 bg-[#e6e0cf] hover:bg-white"
          >
            <Upload className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Export PNG"
            aria-label="Export PNG"
            onClick={exportPng}
            className="flex aspect-square items-center justify-center border border-black/50 bg-[#e6e0cf] hover:bg-white"
          >
            <Download className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="New canvas"
            aria-label="New canvas"
            onClick={primeCanvas}
            className="flex aspect-square items-center justify-center border border-black/50 bg-[#e6e0cf] hover:bg-white"
          >
            <ImagePlus className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Clear"
            aria-label="Clear"
            onClick={primeCanvas}
            className="flex aspect-square items-center justify-center border border-black/50 bg-[#e6e0cf] hover:bg-white"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col bg-[#8d887a] p-4">
        <div className="mb-3 flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.12em] text-black/70">
          <span>MacPaint bitmap studio</span>
          <span>{CANVAS_WIDTH} x {CANVAS_HEIGHT}</span>
        </div>
        <div className="min-h-0 flex-1 overflow-auto border border-black/50 bg-[#6f6a5e] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.35)]">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            className="mx-auto block h-auto max-h-full w-full max-w-[720px] touch-none border border-black bg-white shadow-[6px_6px_0_rgba(0,0,0,0.3)] [image-rendering:pixelated]"
          />
        </div>
      </main>
    </div>
  )
}
