'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { AudioWaveform, CircleStop, Keyboard, Radio, SlidersHorizontal } from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

type Wave = OscillatorType
type MidiInputLike = {
  name?: string
  onmidimessage: ((event: { data: Uint8Array | number[] | null }) => void) | null
}

const keys = [
  ['A', 'C4', 261.63],
  ['W', 'C#4', 277.18],
  ['S', 'D4', 293.66],
  ['E', 'D#4', 311.13],
  ['D', 'E4', 329.63],
  ['F', 'F4', 349.23],
  ['T', 'F#4', 369.99],
  ['G', 'G4', 392.0],
  ['Y', 'G#4', 415.3],
  ['H', 'A4', 440.0],
  ['U', 'A#4', 466.16],
  ['J', 'B4', 493.88],
  ['K', 'C5', 523.25],
] as const

function midiFrequency(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12)
}

export function SynthApp(_: AppWindowProps) {
  const audioRef = useRef<AudioContext | null>(null)
  const filterRef = useRef<BiquadFilterNode | null>(null)
  const wetRef = useRef<GainNode | null>(null)
  const delayRef = useRef<DelayNode | null>(null)
  const feedbackRef = useRef<GainNode | null>(null)
  const [wave, setWave] = useState<Wave>('sawtooth')
  const [attack, setAttack] = useState(0.03)
  const [decay, setDecay] = useState(0.18)
  const [sustain, setSustain] = useState(0.52)
  const [release, setRelease] = useState(0.35)
  const [filter, setFilter] = useState(1400)
  const [resonance, setResonance] = useState(4)
  const [delay, setDelay] = useState(0.16)
  const [delayMix, setDelayMix] = useState(0.22)
  const [feedback, setFeedback] = useState(0.22)
  const [active, setActive] = useState<string[]>([])
  const [midi, setMidi] = useState('MIDI not connected')

  const analyserBars = useMemo(
    () => Array.from({ length: 28 }, (_, index) => 18 + Math.round(38 * Math.abs(Math.sin(index * 0.72)))),
    []
  )

  function context() {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!AudioContextClass) return null
    if (!audioRef.current) {
      const ctx = new AudioContextClass()
      const filterNode = ctx.createBiquadFilter()
      filterNode.type = 'lowpass'
      filterNode.frequency.value = filter
      filterNode.Q.value = resonance
      const delayNode = ctx.createDelay(1)
      delayNode.delayTime.value = delay
      const wet = ctx.createGain()
      wet.gain.value = delayMix
      const feedbackNode = ctx.createGain()
      feedbackNode.gain.value = feedback
      filterNode.connect(wet)
      wet.connect(delayNode)
      delayNode.connect(feedbackNode)
      feedbackNode.connect(delayNode)
      filterNode.connect(ctx.destination)
      delayNode.connect(ctx.destination)
      audioRef.current = ctx
      filterRef.current = filterNode
      wetRef.current = wet
      delayRef.current = delayNode
      feedbackRef.current = feedbackNode
    }
    return audioRef.current
  }

  function play(label: string, frequency: number) {
    const ctx = context()
    const filterNode = filterRef.current
    if (!ctx || !filterNode) return
    void ctx.resume()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const peak = 0.28
    const sustainLevel = Math.max(0.0001, peak * sustain)
    osc.type = wave
    osc.frequency.value = frequency
    gain.gain.setValueAtTime(0.0001, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + attack)
    gain.gain.linearRampToValueAtTime(sustainLevel, ctx.currentTime + attack + decay)
    gain.gain.setValueAtTime(sustainLevel, ctx.currentTime + attack + decay + 0.08)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + attack + decay + release + 0.08)
    osc.connect(gain)
    gain.connect(filterNode)
    osc.start()
    osc.stop(ctx.currentTime + attack + decay + release + 0.12)
    setActive((prev) => [...new Set([...prev, label])])
    window.setTimeout(() => setActive((prev) => prev.filter((item) => item !== label)), (attack + decay + release + 0.1) * 1000)
  }

  useEffect(() => {
    if (filterRef.current) filterRef.current.frequency.value = filter
  }, [filter])

  useEffect(() => {
    if (filterRef.current) filterRef.current.Q.value = resonance
  }, [resonance])

  useEffect(() => {
    if (delayRef.current) delayRef.current.delayTime.value = delay
  }, [delay])

  useEffect(() => {
    if (wetRef.current) wetRef.current.gain.value = delayMix
  }, [delayMix])

  useEffect(() => {
    if (feedbackRef.current) feedbackRef.current.gain.value = feedback
  }, [feedback])

  useEffect(() => {
    function down(event: globalThis.KeyboardEvent) {
      const item = keys.find(([hotkey]) => hotkey.toLowerCase() === event.key.toLowerCase())
      if (item && !event.repeat) play(item[1], item[2])
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  })

  useEffect(() => {
    const nav = navigator as Navigator & {
      requestMIDIAccess?: () => Promise<{ inputs: Map<string, MidiInputLike> }>
    }
    if (!nav.requestMIDIAccess) {
      setMidi('MIDI unavailable in this browser')
      return
    }
    nav.requestMIDIAccess()
      .then((access) => {
        const inputs = [...access.inputs.values()]
        if (!inputs.length) {
          setMidi('No MIDI inputs detected')
          return
        }
        setMidi(inputs.map((input) => input.name ?? 'MIDI input').join(', '))
        inputs.forEach((input) => {
          input.onmidimessage = (event) => {
            const [status = 0, note = 0, velocity = 0] = Array.from(event.data ?? [])
            if ((status & 0xf0) === 0x90 && velocity > 0) play(`MIDI ${note}`, midiFrequency(note))
            if ((status & 0xf0) === 0x80 || ((status & 0xf0) === 0x90 && velocity === 0)) {
              setActive((prev) => prev.filter((item) => item !== `MIDI ${note}`))
            }
          }
        })
      })
      .catch(() => setMidi('MIDI permission denied'))
  }, [])

  return (
    <div className="flex h-full flex-col bg-[#070909] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-black/35 px-4 py-3">
        <div className="flex items-center gap-2">
          <AudioWaveform className="text-[#d7ff2f]" size={19} />
          <div>
            <p className="font-mono text-[10px] uppercase text-white/40">Synth</p>
            <h2 className="font-display text-2xl leading-none">Voltage Garden</h2>
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-full border border-white/10 px-3 py-1 font-mono text-[10px] uppercase text-white/45">
          <Radio size={13} /> {midi}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[250px_1fr]">
        <aside className="space-y-4 border-r border-white/10 bg-black/30 p-4">
          <label className="block text-xs uppercase text-white/45">Waveform</label>
          <select value={wave} onChange={(event) => setWave(event.target.value as Wave)} className="w-full rounded border border-white/10 bg-black px-3 py-2 text-sm outline-none">
            {(['sine', 'square', 'sawtooth', 'triangle'] as Wave[]).map((item) => <option key={item}>{item}</option>)}
          </select>
          {[
            ['Attack', attack, 0.005, 0.8, setAttack],
            ['Decay', decay, 0.01, 1.2, setDecay],
            ['Sustain', sustain, 0.05, 1, setSustain],
            ['Release', release, 0.05, 1.6, setRelease],
            ['Filter', filter, 220, 6000, setFilter],
            ['Resonance', resonance, 0.1, 18, setResonance],
            ['Delay', delay, 0, 0.8, setDelay],
            ['Delay Mix', delayMix, 0, 0.75, setDelayMix],
            ['Feedback', feedback, 0, 0.82, setFeedback],
          ].map(([label, value, min, max, setter]) => (
            <label key={label as string} className="block">
              <span className="mb-1 flex items-center gap-1.5 text-xs uppercase text-white/45"><SlidersHorizontal size={13} />{label as string}</span>
              <input
                type="range"
                min={min as number}
                max={max as number}
                step={(label as string) === 'Filter' ? 10 : 0.01}
                value={value as number}
                onChange={(event) => (setter as (value: number) => void)(Number(event.target.value))}
                className="w-full accent-[#d7ff2f]"
              />
            </label>
          ))}
          <button onClick={() => setActive([])} className="flex items-center gap-2 rounded border border-white/10 px-3 py-2 text-sm text-white/65 hover:bg-white/10">
            <CircleStop size={15} /> Panic
          </button>
        </aside>

        <section className="flex min-w-0 flex-col justify-between p-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase text-white/45"><Keyboard size={14} /> computer keyboard input</div>
            <div className="flex h-40 items-end gap-1 rounded-lg bg-black/40 p-3">
              {analyserBars.map((height, index) => (
                <div key={index} className="flex-1 rounded-t bg-[#d7ff2f]/70 transition-all" style={{ height: active.length ? `${Math.min(92, height + active.length * 14)}%` : `${height}%` }} />
              ))}
            </div>
          </div>
          <div className="mt-5 flex h-44 items-end overflow-x-auto rounded-xl border border-white/10 bg-[#ece7d7] p-3">
            {keys.map(([hotkey, label, frequency]) => {
              const sharp = label.includes('#')
              return (
                <button
                  key={label}
                  onMouseDown={() => play(label, frequency)}
                  className={`${sharp ? 'z-10 -mx-3 mb-16 h-24 w-10 bg-black text-white' : 'h-36 w-14 bg-white text-black'} flex shrink-0 flex-col items-center justify-end rounded-b border border-black/20 pb-2 shadow ${active.includes(label) ? 'outline outline-2 outline-[#d7ff2f]' : ''}`}
                >
                  <span className="text-[10px] font-bold">{hotkey}</span>
                  <span className="text-[10px] opacity-55">{label}</span>
                </button>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}
