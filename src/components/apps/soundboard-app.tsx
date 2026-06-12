'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Disc3,
  FileAudio,
  Mic,
  Pause,
  Play,
  Plus,
  Radio,
  Save,
  Trash2,
  Volume2,
} from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

type PadKind = 'preset' | 'file' | 'recording'

interface SoundPad {
  id: string
  name: string
  kind: PadKind
  color: string
  createdAt: number
  duration?: number
  url?: string
  preset?: PresetId
}

type PresetId = 'kick' | 'snare' | 'hat' | 'laser' | 'chime' | 'bass'

const STORAGE_KEY = 'morris-soundboard-metadata-v1'

const PRESETS: SoundPad[] = [
  { id: 'preset-kick', name: 'Kick', kind: 'preset', color: '#ef4444', createdAt: 1, preset: 'kick' },
  { id: 'preset-snare', name: 'Snare', kind: 'preset', color: '#f97316', createdAt: 2, preset: 'snare' },
  { id: 'preset-hat', name: 'Hat', kind: 'preset', color: '#eab308', createdAt: 3, preset: 'hat' },
  { id: 'preset-laser', name: 'Laser', kind: 'preset', color: '#22c55e', createdAt: 4, preset: 'laser' },
  { id: 'preset-chime', name: 'Chime', kind: 'preset', color: '#38bdf8', createdAt: 5, preset: 'chime' },
  { id: 'preset-bass', name: 'Bass', kind: 'preset', color: '#a855f7', createdAt: 6, preset: 'bass' },
]

const PAD_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#38bdf8', '#a855f7', '#ec4899']

function saveMetadata(pads: SoundPad[]) {
  const metadata = pads
    .filter((pad) => pad.kind !== 'preset')
    .map(({ id, name, kind, color, createdAt, duration }) => ({ id, name, kind, color, createdAt, duration }))
  localStorage.setItem(STORAGE_KEY, JSON.stringify(metadata))
}

function loadMetadata(): SoundPad[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return []
    const parsed = JSON.parse(saved) as SoundPad[]
    return Array.isArray(parsed)
      ? parsed.map((pad) => ({ ...pad, name: pad.name || 'Untitled sound' }))
      : []
  } catch {
    return []
  }
}

export function SoundboardApp(_props: AppWindowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const urlsRef = useRef<string[]>([])
  const rafRef = useRef<number | null>(null)

  const [pads, setPads] = useState<SoundPad[]>(PRESETS)
  const [recording, setRecording] = useState(false)
  const [armed, setArmed] = useState(false)
  const [activePad, setActivePad] = useState<string | null>(null)
  const [status, setStatus] = useState('ready')

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const ctx = new AudioContext()
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 1024
      analyser.connect(ctx.destination)
      audioContextRef.current = ctx
      analyserRef.current = analyser
    }
    return audioContextRef.current
  }, [])

  const drawWaveform = useCallback(() => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (!canvas || !analyser) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = new Uint8Array(analyser.fftSize)
    const tick = () => {
      analyser.getByteTimeDomainData(data)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#08070a'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.strokeStyle = activePad ? '#7dd3fc' : '#f472b6'
      ctx.lineWidth = 2
      ctx.beginPath()
      for (let i = 0; i < data.length; i++) {
        const x = (i / (data.length - 1)) * canvas.width
        const y = (data[i] / 255) * canvas.height
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      for (let x = 0; x < canvas.width; x += 24) {
        ctx.beginPath()
        ctx.moveTo(x, 0)
        ctx.lineTo(x, canvas.height)
        ctx.stroke()
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    tick()
  }, [activePad])

  useEffect(() => {
    setPads([...PRESETS, ...loadMetadata()])
  }, [])

  useEffect(() => {
    drawWaveform()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [drawWaveform])

  useEffect(() => {
    return () => {
      urlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      mediaStreamRef.current?.getTracks().forEach((track) => track.stop())
      audioContextRef.current?.close().catch(() => undefined)
    }
  }, [])

  useEffect(() => {
    try {
      saveMetadata(pads)
    } catch {
      setStatus('metadata not saved')
    }
  }, [pads])

  const playPreset = (preset: PresetId) => {
    const ctx = getAudioContext()
    void ctx.resume()

    const now = ctx.currentTime
    const out = analyserRef.current ?? ctx.destination
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(out)
    gain.gain.setValueAtTime(0.0001, now)

    if (preset === 'kick') {
      osc.type = 'sine'
      osc.frequency.setValueAtTime(140, now)
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.22)
      gain.gain.exponentialRampToValueAtTime(0.9, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32)
      filter.frequency.value = 900
    }
    if (preset === 'snare') {
      osc.type = 'triangle'
      osc.frequency.value = 190
      gain.gain.exponentialRampToValueAtTime(0.55, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.18)
      filter.type = 'highpass'
      filter.frequency.value = 700
    }
    if (preset === 'hat') {
      osc.type = 'square'
      osc.frequency.value = 7200
      gain.gain.exponentialRampToValueAtTime(0.25, now + 0.005)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.08)
      filter.type = 'highpass'
      filter.frequency.value = 5000
    }
    if (preset === 'laser') {
      osc.type = 'sawtooth'
      osc.frequency.setValueAtTime(1200, now)
      osc.frequency.exponentialRampToValueAtTime(90, now + 0.5)
      gain.gain.exponentialRampToValueAtTime(0.45, now + 0.01)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55)
      filter.frequency.value = 2200
    }
    if (preset === 'chime') {
      osc.type = 'sine'
      osc.frequency.value = 880
      gain.gain.exponentialRampToValueAtTime(0.42, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.1)
      filter.frequency.value = 4000
    }
    if (preset === 'bass') {
      osc.type = 'sawtooth'
      osc.frequency.value = 82
      gain.gain.exponentialRampToValueAtTime(0.6, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45)
      filter.type = 'lowpass'
      filter.frequency.value = 360
    }

    osc.start(now)
    osc.stop(now + 1.2)
  }

  const playPad = (pad: SoundPad) => {
    setActivePad(pad.id)
    setStatus(`playing ${pad.name}`)

    if (pad.preset) {
      playPreset(pad.preset)
      window.setTimeout(() => setActivePad(null), 700)
      return
    }

    if (!pad.url) {
      setStatus('sound file unavailable')
      window.setTimeout(() => setActivePad(null), 450)
      return
    }

    const ctx = getAudioContext()
    void ctx.resume()
    const audio = new Audio(pad.url)
    const source = ctx.createMediaElementSource(audio)
    source.connect(analyserRef.current ?? ctx.destination)
    audio.onended = () => {
      source.disconnect()
      setActivePad(null)
    }
    audio.play().catch(() => {
      setStatus('playback blocked')
      setActivePad(null)
    })
  }

  const importFiles = (files: FileList | null) => {
    if (!files) return
    const nextPads: SoundPad[] = []
    Array.from(files).forEach((file) => {
      const url = URL.createObjectURL(file)
      urlsRef.current.push(url)
      nextPads.push({
        id: `file-${Date.now()}-${file.name}`,
        name: file.name.replace(/\.[^.]+$/, ''),
        kind: 'file',
        color: PAD_COLORS[(pads.length + nextPads.length) % PAD_COLORS.length],
        createdAt: Date.now(),
        url,
      })
    })
    setPads((current) => [...current, ...nextPads])
    setStatus(`${nextPads.length} sound added`)
  }

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('recording unavailable')
      return
    }

    try {
      const ctx = getAudioContext()
      await ctx.resume()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaStreamRef.current = stream
      const source = ctx.createMediaStreamSource(stream)
      source.connect(analyserRef.current ?? ctx.destination)

      chunksRef.current = []
      const recorder = new MediaRecorder(stream)
      mediaRecorderRef.current = recorder
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data)
      }
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const url = URL.createObjectURL(blob)
        urlsRef.current.push(url)
        setPads((current) => [
          ...current,
          {
            id: `recording-${Date.now()}`,
            name: `Recording ${current.filter((pad) => pad.kind === 'recording').length + 1}`,
            kind: 'recording',
            color: PAD_COLORS[current.length % PAD_COLORS.length],
            createdAt: Date.now(),
            duration: blob.size,
            url,
          },
        ])
        stream.getTracks().forEach((track) => track.stop())
        setRecording(false)
        setArmed(false)
        setStatus('recording saved')
      }
      recorder.start()
      setRecording(true)
      setArmed(true)
      setStatus('recording')
    } catch {
      setStatus('mic permission denied')
      setRecording(false)
      setArmed(false)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
  }

  const removePad = (id: string) => {
    setPads((current) => current.filter((pad) => pad.kind === 'preset' || pad.id !== id))
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col bg-[#0f0c14] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-[#17111f] px-4 py-3">
        <div>
          <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-fuchsia-200/70">Soundboard</div>
          <div className="text-lg font-semibold">Pad sampler and recorder</div>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            multiple
            className="hidden"
            onChange={(event) => importFiles(event.target.files)}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="flex h-9 items-center gap-2 border border-white/15 bg-white/10 px-3 text-sm hover:bg-white/15"
          >
            <FileAudio className="h-4 w-4" />
            Import
          </button>
          <button
            type="button"
            onClick={recording ? stopRecording : startRecording}
            className={`flex h-9 items-center gap-2 border px-3 text-sm ${
              recording
                ? 'border-red-300/70 bg-red-500 text-white'
                : 'border-white/15 bg-fuchsia-500/20 hover:bg-fuchsia-500/30'
            }`}
          >
            {recording ? <Pause className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {recording ? 'Stop' : 'Record'}
          </button>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[1fr_260px]">
        <section className="min-h-0 overflow-y-auto p-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            {pads.map((pad) => (
              <div
                key={pad.id}
                className={`relative min-h-32 border bg-[#181220] p-3 shadow-[0_14px_34px_rgba(0,0,0,0.28)] ${
                  activePad === pad.id ? 'border-white' : 'border-white/10'
                }`}
              >
                <button
                  type="button"
                  onClick={() => playPad(pad)}
                  className="flex h-full min-h-24 w-full flex-col items-start justify-between text-left"
                >
                  <div className="flex w-full items-start justify-between gap-2">
                    <div
                      className="flex h-11 w-11 items-center justify-center rounded-full text-black shadow-[0_0_24px_var(--pad-glow)]"
                      style={{ background: pad.color, '--pad-glow': `${pad.color}66` } as React.CSSProperties}
                    >
                      {pad.kind === 'preset' ? <Disc3 className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </div>
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/40">
                      {pad.kind}
                    </span>
                  </div>
                  <div>
                    <div className="text-base font-semibold">{pad.name}</div>
                    <div className="mt-1 text-xs text-white/45">
                      {pad.url || pad.preset ? 'ready' : 'metadata only'}
                    </div>
                  </div>
                </button>
                {pad.kind !== 'preset' ? (
                  <button
                    type="button"
                    title="Remove"
                    aria-label="Remove"
                    onClick={() => removePad(pad.id)}
                    className="absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center text-white/45 hover:bg-white/10 hover:text-white"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            ))}

            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-32 flex-col items-center justify-center gap-2 border border-dashed border-white/20 bg-white/[0.03] text-white/45 hover:border-white/40 hover:text-white"
            >
              <Plus className="h-6 w-6" />
              Add sound
            </button>
          </div>
        </section>

        <aside className="flex min-h-0 flex-col border-l border-white/10 bg-[#15101c] p-4">
          <div className="mb-4 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.18em] text-fuchsia-200/70">
            <Radio className="h-4 w-4" />
            Monitor
          </div>
          <canvas ref={canvasRef} width={420} height={180} className="h-32 w-full border border-white/10 bg-black" />
          <div className="mt-4 space-y-3 text-sm text-white/70">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span>Status</span>
              <span className="font-mono text-xs text-white">{status}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span>Pads</span>
              <span className="font-mono text-xs text-white">{pads.length}</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <span>Recorder</span>
              <span className="font-mono text-xs text-white">{armed ? 'armed' : 'idle'}</span>
            </div>
            <div className="flex items-start gap-2 rounded-sm border border-white/10 bg-white/[0.03] p-3 text-xs leading-5 text-white/45">
              <Save className="mt-0.5 h-4 w-4 shrink-0" />
              Sound names, colors, and types are saved locally. Session blobs play until the tab reloads.
            </div>
          </div>
        </aside>
      </main>
    </div>
  )
}
