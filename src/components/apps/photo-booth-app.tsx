'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Aperture,
  Camera,
  Download,
  Image as ImageIcon,
  RefreshCw,
  SlidersHorizontal,
  Trash2,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type FilterId = 'normal' | 'mono' | 'noir' | 'sunset' | 'aqua' | 'poster'

interface CapturedPhoto {
  id: string
  src: string
  filter: FilterId
  timestamp: string
}

const FILTERS: Record<FilterId, { label: string; css: string; canvas: string }> = {
  normal: { label: 'Normal', css: 'none', canvas: 'none' },
  mono: { label: 'Mono', css: 'grayscale(1) contrast(1.12)', canvas: 'grayscale(1) contrast(1.12)' },
  noir: {
    label: 'Noir',
    css: 'grayscale(1) contrast(1.55) brightness(0.82)',
    canvas: 'grayscale(1) contrast(1.55) brightness(0.82)',
  },
  sunset: {
    label: 'Sunset',
    css: 'sepia(0.35) saturate(1.7) hue-rotate(-18deg) contrast(1.08)',
    canvas: 'sepia(0.35) saturate(1.7) hue-rotate(-18deg) contrast(1.08)',
  },
  aqua: {
    label: 'Aqua',
    css: 'saturate(1.5) hue-rotate(145deg) contrast(1.08)',
    canvas: 'saturate(1.5) hue-rotate(145deg) contrast(1.08)',
  },
  poster: {
    label: 'Poster',
    css: 'contrast(1.7) saturate(1.8) brightness(1.05)',
    canvas: 'contrast(1.7) saturate(1.8) brightness(1.05)',
  },
}

function drawDemoFrame(canvas: HTMLCanvasElement, tick: number) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height
  const gradient = ctx.createLinearGradient(0, 0, width, height)
  gradient.addColorStop(0, '#162033')
  gradient.addColorStop(0.45, '#385067')
  gradient.addColorStop(1, '#c47d5a')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  ctx.fillStyle = 'rgba(255,255,255,0.08)'
  for (let i = 0; i < 18; i++) {
    const x = (Math.sin(tick / 38 + i) * 0.5 + 0.5) * width
    const y = ((i * 73 + tick * 1.2) % height) - 40
    ctx.beginPath()
    ctx.arc(x, y, 18 + (i % 5) * 7, 0, Math.PI * 2)
    ctx.fill()
  }

  const cx = width / 2
  const cy = height / 2 + Math.sin(tick / 30) * 8
  ctx.fillStyle = 'rgba(248,241,226,0.92)'
  ctx.beginPath()
  ctx.arc(cx, cy - 54, 58, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = 'rgba(22,32,51,0.95)'
  ctx.beginPath()
  ctx.arc(cx - 20, cy - 62, 6, 0, Math.PI * 2)
  ctx.arc(cx + 20, cy - 62, 6, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = 'rgba(22,32,51,0.75)'
  ctx.lineWidth = 5
  ctx.beginPath()
  ctx.arc(cx, cy - 48, 22, 0.1, Math.PI - 0.1)
  ctx.stroke()

  ctx.fillStyle = 'rgba(245,245,245,0.86)'
  ctx.beginPath()
  ctx.roundRect(cx - 94, cy + 8, 188, 142, 42)
  ctx.fill()

  ctx.fillStyle = 'rgba(255,255,255,0.72)'
  ctx.font = '600 18px ui-monospace, SFMono-Regular, Menlo, monospace'
  ctx.textAlign = 'center'
  ctx.fillText('DEMO CAMERA', cx, height - 34)
}

export function PhotoBoothApp() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const demoCanvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [cameraState, setCameraState] = useState<'loading' | 'ready' | 'demo'>('loading')
  const [cameraMessage, setCameraMessage] = useState('Requesting camera access')
  const [filter, setFilter] = useState<FilterId>('normal')
  const [photos, setPhotos] = useState<CapturedPhoto[]>([])
  const [flash, setFlash] = useState(false)
  const filterStyle = useMemo(() => ({ filter: FILTERS[filter].css }), [filter])

  const startCamera = useCallback(async () => {
    setCameraState('loading')
    setCameraMessage('Requesting camera access')

    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Camera API is not available in this browser')
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })

      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraState('ready')
      setCameraMessage('Camera ready')
    } catch (error) {
      setCameraState('demo')
      setCameraMessage(error instanceof Error ? error.message : 'Camera unavailable')
    }
  }, [])

  useEffect(() => {
    void startCamera()
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
    }
  }, [startCamera])

  useEffect(() => {
    if (cameraState !== 'demo') return
    let frame = 0
    let animationId = 0

    const draw = () => {
      if (demoCanvasRef.current) drawDemoFrame(demoCanvasRef.current, frame)
      frame += 1
      animationId = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(animationId)
  }, [cameraState])

  const capture = useCallback(() => {
    const source =
      cameraState === 'ready' && videoRef.current ? videoRef.current : demoCanvasRef.current
    if (!source) return

    const canvas = document.createElement('canvas')
    canvas.width = cameraState === 'ready' ? 1280 : 960
    canvas.height = cameraState === 'ready' ? 720 : 640
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.filter = FILTERS[filter].canvas
    ctx.translate(canvas.width, 0)
    ctx.scale(-1, 1)
    ctx.drawImage(source, 0, 0, canvas.width, canvas.height)
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.filter = 'none'

    const src = canvas.toDataURL('image/png')
    const photo: CapturedPhoto = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      src,
      filter,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setPhotos((current) => [photo, ...current].slice(0, 18))
    setFlash(true)
    window.setTimeout(() => setFlash(false), 160)
  }, [cameraState, filter])

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#141416] text-white">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-[#202025] px-4 py-3">
        <div className="min-w-0">
          <h2 className="font-display text-base font-semibold leading-tight">Photo Booth</h2>
          <p className="truncate text-xs text-white/45">{cameraMessage}</p>
        </div>
        <button
          onClick={() => void startCamera()}
          className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 text-xs text-white/80 hover:bg-white/10"
        >
          <RefreshCw size={14} />
          Camera
        </button>
      </div>

      <div className="grid min-h-0 flex-1 grid-rows-[minmax(0,1fr)_auto] lg:grid-cols-[minmax(0,1fr)_220px] lg:grid-rows-1">
        <main className="relative min-h-0 overflow-hidden bg-[#09090b]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.12),transparent_32%),radial-gradient(circle_at_80%_80%,rgba(244,114,182,0.16),transparent_32%)]" />
          <div className="relative flex h-full items-center justify-center p-4">
            <div className="relative aspect-video w-full max-w-4xl overflow-hidden rounded-md border border-white/10 bg-black shadow-2xl shadow-black/70">
              <video
                ref={videoRef}
                className={cn(
                  'h-full w-full object-cover transition-[filter] duration-200',
                  cameraState === 'ready' ? 'block' : 'hidden'
                )}
                style={filterStyle}
                muted
                playsInline
              />
              <canvas
                ref={demoCanvasRef}
                width={960}
                height={640}
                className={cn(
                  'h-full w-full object-cover transition-[filter] duration-200',
                  cameraState === 'demo' ? 'block' : 'hidden'
                )}
                style={filterStyle}
              />
              {cameraState === 'loading' && (
                <div className="grid h-full place-items-center bg-[#111114]">
                  <div className="flex flex-col items-center gap-3 text-white/55">
                    <Video size={34} />
                    <span className="text-xs uppercase tracking-[0.18em]">opening camera</span>
                  </div>
                </div>
              )}
              <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(transparent_0,rgba(255,255,255,0.035)_50%,transparent_100%)]" />
              {flash && <div className="absolute inset-0 bg-white/85" />}
            </div>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-3 bg-gradient-to-t from-black/80 to-transparent p-5">
            <button
              onClick={capture}
              className="grid h-16 w-16 place-items-center rounded-full border-4 border-white/80 bg-[#e13d48] text-white shadow-xl shadow-black/50 transition-transform hover:scale-105 active:scale-95"
              title="Capture"
            >
              <Camera size={28} />
            </button>
          </div>
        </main>

        <aside className="flex min-h-0 flex-col border-t border-white/10 bg-[#1d1d21] lg:border-l lg:border-t-0">
          <div className="border-b border-white/10 p-3">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
              <SlidersHorizontal size={14} />
              Filters
            </div>
            <div className="grid grid-cols-3 gap-2 lg:grid-cols-2">
              {(Object.keys(FILTERS) as FilterId[]).map((id) => (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  className={cn(
                    'h-9 rounded-md border px-2 text-xs transition-colors',
                    filter === id
                      ? 'border-[#e13d48] bg-[#e13d48]/20 text-white'
                      : 'border-white/10 bg-white/5 text-white/65 hover:bg-white/10'
                  )}
                >
                  {FILTERS[id].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex min-h-0 flex-1 flex-col">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <span className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">
                <ImageIcon size={14} />
                Gallery
              </span>
              {photos.length > 0 && (
                <button
                  onClick={() => setPhotos([])}
                  className="grid h-7 w-7 place-items-center rounded text-white/45 hover:bg-white/10 hover:text-white"
                  title="Clear gallery"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>

            {photos.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-2 p-5 text-center text-white/35">
                <Aperture size={30} />
                <p className="text-xs leading-relaxed">Captured photos will appear here.</p>
              </div>
            ) : (
              <div className="grid min-h-0 flex-1 grid-cols-3 gap-2 overflow-auto p-3 lg:grid-cols-1">
                {photos.map((photo) => (
                  <div key={photo.id} className="group relative overflow-hidden rounded border border-white/10 bg-black">
                    <div
                      className="aspect-video w-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${photo.src})` }}
                    />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-black/70 px-2 py-1 text-[10px] text-white/75 opacity-0 transition-opacity group-hover:opacity-100">
                      <span>{FILTERS[photo.filter].label} / {photo.timestamp}</span>
                      <a href={photo.src} download={`photo-booth-${photo.id}.png`} title="Download">
                        <Download size={13} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
