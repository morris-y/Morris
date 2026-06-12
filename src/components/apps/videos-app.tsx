'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import {
  FastForward,
  Link,
  Pause,
  Play,
  Plus,
  Rewind,
  ScanLine,
  Trash2,
  Video,
} from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

interface PlaylistItem {
  id: string
  title: string
  addedAt: number
}

const STORAGE_KEY = 'morris-videos-playlist-v1'

const DEFAULT_PLAYLIST: PlaylistItem[] = [
  { id: 'dQw4w9WgXcQ', title: 'Sample Tape 001', addedAt: 1 },
  { id: 'jfKfPfyJRdk', title: 'Lofi Control Room', addedAt: 2 },
  { id: '5qap5aO4i9A', title: 'Late Night Broadcast', addedAt: 3 },
]

function extractYouTubeId(input: string): string | null {
  const trimmed = input.trim()
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed

  try {
    const url = new URL(trimmed)
    if (url.hostname.includes('youtu.be')) return url.pathname.replace('/', '').slice(0, 11) || null
    if (url.searchParams.has('v')) return url.searchParams.get('v')?.slice(0, 11) ?? null
    const embed = url.pathname.match(/\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/)
    return embed?.[2] ?? null
  } catch {
    const match = trimmed.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{11})/)
    return match?.[1] ?? null
  }
}

function sendCommand(frame: HTMLIFrameElement | null, func: string, args: unknown[] = []) {
  frame?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func, args }), '*')
}

export function VideosApp(_props: AppWindowProps) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [playlist, setPlaylist] = useState<PlaylistItem[]>(DEFAULT_PLAYLIST)
  const [activeId, setActiveId] = useState(DEFAULT_PLAYLIST[0]?.id ?? '')
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [status, setStatus] = useState('ready')

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (!saved) return
      const parsed = JSON.parse(saved) as PlaylistItem[]
      if (Array.isArray(parsed) && parsed.length > 0) {
        setPlaylist(parsed)
        setActiveId(parsed[0].id)
      }
    } catch {
      setStatus('playlist reset')
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playlist))
    } catch {
      setStatus('storage full')
    }
  }, [playlist])

  const activeIndex = Math.max(0, playlist.findIndex((item) => item.id === activeId))
  const activeItem = playlist[activeIndex] ?? playlist[0]
  const embedUrl = useMemo(() => {
    if (!activeItem) return ''
    const origin = typeof window === 'undefined' ? '' : window.location.origin
    return `https://www.youtube.com/embed/${activeItem.id}?enablejsapi=1&origin=${encodeURIComponent(origin)}&rel=0&modestbranding=1`
  }, [activeItem])

  const addVideo = () => {
    const id = extractYouTubeId(url)
    if (!id) {
      setStatus('invalid url')
      return
    }

    const item: PlaylistItem = {
      id,
      title: title.trim() || `Tape ${String(playlist.length + 1).padStart(3, '0')}`,
      addedAt: Date.now(),
    }

    setPlaylist((current) => {
      const withoutDuplicate = current.filter((entry) => entry.id !== id)
      return [item, ...withoutDuplicate]
    })
    setActiveId(id)
    setUrl('')
    setTitle('')
    setStatus('loaded')
    setIsPlaying(false)
  }

  const removeVideo = (id: string) => {
    setPlaylist((current) => {
      const next = current.filter((item) => item.id !== id)
      if (activeId === id) setActiveId(next[0]?.id ?? '')
      return next
    })
  }

  const playPause = () => {
    const next = !isPlaying
    sendCommand(frameRef.current, next ? 'playVideo' : 'pauseVideo')
    setIsPlaying(next)
    setStatus(next ? 'playing' : 'paused')
  }

  const rewind = () => {
    sendCommand(frameRef.current, 'seekTo', [0, true])
    sendCommand(frameRef.current, 'playVideo')
    setIsPlaying(true)
    setStatus('rewind')
  }

  const scan = (direction: 1 | -1) => {
    if (playlist.length === 0) return
    const nextIndex = (activeIndex + direction + playlist.length) % playlist.length
    setActiveId(playlist[nextIndex].id)
    setIsPlaying(false)
    setStatus(direction > 0 ? 'scan forward' : 'scan back')
  }

  return (
    <div className="flex h-full min-h-0 w-full bg-[#13110e] text-[#f8eddb]">
      <section className="flex min-w-0 flex-1 flex-col p-4">
        <div className="relative min-h-0 flex-1 overflow-hidden border border-[#6f4e2c] bg-black shadow-[0_0_0_6px_#21170f,0_18px_60px_rgba(0,0,0,0.55)]">
          <div className="pointer-events-none absolute inset-0 z-10 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0px,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)] mix-blend-screen" />
          <div className="pointer-events-none absolute left-3 top-3 z-20 rounded border border-red-500/70 bg-black/70 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-red-400">
            REC {status}
          </div>
          {activeItem ? (
            <iframe
              key={activeItem.id}
              ref={frameRef}
              src={embedUrl}
              title={activeItem.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-white/45">
              <Video className="mr-2 h-5 w-5" />
              No tape loaded
            </div>
          )}
        </div>

        <div className="mt-4 border border-[#6f4e2c] bg-[#2b2118] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
          <div className="mb-3 flex items-center justify-between gap-3 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c8a56c]">
            <span>{activeItem?.title ?? 'Empty deck'}</span>
            <span>{activeIndex + 1 || 0}/{playlist.length}</span>
          </div>
          <div className="grid grid-cols-5 gap-2">
            <button
              type="button"
              title="Rewind to start"
              aria-label="Rewind to start"
              onClick={rewind}
              className="flex h-12 items-center justify-center border border-black bg-[#d7d0bc] text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.7)] hover:bg-white"
            >
              <Rewind className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Scan back"
              aria-label="Scan back"
              onClick={() => scan(-1)}
              className="flex h-12 items-center justify-center border border-black bg-[#d7d0bc] text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.7)] hover:bg-white"
            >
              <ScanLine className="h-5 w-5 rotate-180" />
            </button>
            <button
              type="button"
              title={isPlaying ? 'Pause' : 'Play'}
              aria-label={isPlaying ? 'Pause' : 'Play'}
              onClick={playPause}
              className="flex h-12 items-center justify-center border border-black bg-[#f97316] text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.45)] hover:bg-[#fb923c]"
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
            <button
              type="button"
              title="Scan forward"
              aria-label="Scan forward"
              onClick={() => scan(1)}
              className="flex h-12 items-center justify-center border border-black bg-[#d7d0bc] text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.7)] hover:bg-white"
            >
              <ScanLine className="h-5 w-5" />
            </button>
            <button
              type="button"
              title="Fast forward"
              aria-label="Fast forward"
              onClick={() => {
                sendCommand(frameRef.current, 'seekTo', [600, true])
                setStatus('fast forward')
              }}
              className="flex h-12 items-center justify-center border border-black bg-[#d7d0bc] text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.7)] hover:bg-white"
            >
              <FastForward className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <aside className="flex w-80 shrink-0 flex-col border-l border-[#6f4e2c] bg-[#1b1712]">
        <div className="border-b border-[#6f4e2c] p-4">
          <div className="mb-3 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c8a56c]">
            <Link className="h-4 w-4" />
            URL import
          </div>
          <div className="space-y-2">
            <input
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="youtube.com/watch?v=..."
              className="h-9 w-full border border-[#6f4e2c] bg-black/35 px-3 text-sm text-[#f8eddb] outline-none placeholder:text-[#c8a56c]/45 focus:border-[#f97316]"
            />
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Tape label"
              className="h-9 w-full border border-[#6f4e2c] bg-black/35 px-3 text-sm text-[#f8eddb] outline-none placeholder:text-[#c8a56c]/45 focus:border-[#f97316]"
            />
            <button
              type="button"
              onClick={addVideo}
              className="flex h-9 w-full items-center justify-center gap-2 border border-black bg-[#f97316] text-sm font-bold text-black shadow-[inset_0_2px_0_rgba(255,255,255,0.35)] hover:bg-[#fb923c]"
            >
              <Plus className="h-4 w-4" />
              Add tape
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <div className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-[#c8a56c]">
            Playlist
          </div>
          <div className="space-y-2">
            {playlist.map((item, index) => (
              <div
                key={item.id}
                className={`group flex items-center gap-3 border p-2 ${
                  activeId === item.id
                    ? 'border-[#f97316] bg-[#3a2818]'
                    : 'border-[#6f4e2c]/65 bg-black/20 hover:bg-[#2b2118]'
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(item.id)
                    setIsPlaying(false)
                  }}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[#c8a56c]/70">
                    CH {String(index + 1).padStart(2, '0')}
                  </div>
                  <div className="truncate text-sm font-semibold text-[#f8eddb]">{item.title}</div>
                  <div className="truncate font-mono text-[10px] text-[#c8a56c]/60">{item.id}</div>
                </button>
                <button
                  type="button"
                  title="Remove"
                  aria-label="Remove"
                  onClick={() => removeVideo(item.id)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center text-[#c8a56c]/60 opacity-70 hover:bg-black/30 hover:text-red-300 group-hover:opacity-100"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  )
}
