'use client'

import { useMemo, useState } from 'react'
import { Languages, Music, Pause, Play, Plus, Rewind, SkipForward } from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

const tracks = [
  { id: 'lofi', title: 'Taipei Boot Chime', artist: 'Morris Lab', video: 'jfKfPfyJRdk', lyric: 'City lights compile / night turns into signal' },
  { id: 'synth', title: 'Finder Window Dream', artist: 'Desk Ensemble', video: '5qap5aO4i9A', lyric: 'Drag the corner slowly / let the pixels breathe' },
]

function videoId(url: string) {
  return url.match(/(?:v=|youtu\.be\/|embed\/)([\w-]{8,})/)?.[1] ?? ''
}

export function IpodApp(_: AppWindowProps) {
  const [library, setLibrary] = useState(tracks)
  const [activeId, setActiveId] = useState(tracks[0].id)
  const [url, setUrl] = useState('')
  const [playing, setPlaying] = useState(false)
  const [translated, setTranslated] = useState(false)
  const active = library.find((track) => track.id === activeId) ?? library[0]
  const translatedLyric = useMemo(() => active.lyric.split('/').map((part) => `譯：${part.trim()}`).join(' / '), [active])

  function addYoutube() {
    const id = videoId(url)
    if (!id) return
    const track = { id, title: `Imported Tape ${library.length + 1}`, artist: 'YouTube Import', video: id, lyric: 'Imported from the web / waiting for liner notes' }
    setLibrary((prev) => [...prev, track])
    setActiveId(track.id)
    setUrl('')
  }

  return (
    <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_50%_0%,rgba(215,255,47,.18),transparent_40%),#080908] p-5 text-white">
      <div className="grid h-full w-full max-w-5xl grid-cols-[330px_1fr] gap-5">
        <section className="rounded-[34px] border border-white/18 bg-[#e7e2d2] p-5 text-black shadow-2xl">
          <div className="rounded-xl border border-black/20 bg-[#9aa08f] p-3 shadow-inner">
            <p className="font-mono text-[10px] uppercase">Now Playing</p>
            <h2 className="mt-2 text-xl font-bold leading-tight">{active.title}</h2>
            <p className="text-sm opacity-70">{active.artist}</p>
            <div className="mt-3 h-20 rounded bg-[repeating-linear-gradient(90deg,rgba(0,0,0,.45)_0_2px,transparent_2px_8px)]" />
          </div>
          <div className="mt-7 aspect-square rounded-full border border-black/15 bg-[#f7f4eb] p-9 shadow-inner">
            <div className="grid h-full grid-cols-3 grid-rows-3 place-items-center rounded-full border border-black/10 bg-[#d8d2c0]">
              <button className="col-start-2 text-xs font-bold uppercase">Menu</button>
              <button aria-label="Rewind"><Rewind size={25} /></button>
              <button onClick={() => setPlaying((value) => !value)} className="rounded-full bg-white p-5 shadow" aria-label="Play pause">
                {playing ? <Pause size={28} /> : <Play size={28} />}
              </button>
              <button aria-label="Next"><SkipForward size={25} /></button>
              <button className="col-start-2 row-start-3 text-xs font-bold uppercase">Select</button>
            </div>
          </div>
        </section>

        <section className="min-w-0 rounded-xl border border-white/10 bg-black/45 p-4">
          <div className="mb-4 flex gap-2">
            <input value={url} onChange={(event) => setUrl(event.target.value)} placeholder="Paste YouTube URL" className="min-w-0 flex-1 rounded border border-white/10 bg-white/[0.05] px-3 py-2 text-sm outline-none placeholder:text-white/30" />
            <button onClick={addYoutube} className="flex items-center gap-1.5 rounded bg-[#d7ff2f] px-3 text-sm font-semibold text-black"><Plus size={15} />Import</button>
          </div>
          <div className="grid h-[calc(100%-56px)] grid-rows-[1fr_auto] gap-4">
            <div className="grid grid-cols-[220px_1fr] gap-4 overflow-hidden">
              <div className="space-y-2 overflow-y-auto">
                {library.map((track) => (
                  <button key={track.id} onClick={() => setActiveId(track.id)} className={`w-full rounded-lg border px-3 py-2 text-left ${active.id === track.id ? 'border-[#d7ff2f]/45 bg-[#d7ff2f]/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'}`}>
                    <span className="flex items-center gap-2 text-sm"><Music size={15} />{track.title}</span>
                    <span className="block truncate text-xs text-white/42">{track.artist}</span>
                  </button>
                ))}
              </div>
              <iframe title={active.title} src={`https://www.youtube.com/embed/${active.video}?autoplay=${playing ? 1 : 0}`} className="h-full min-h-[260px] w-full rounded-lg border border-white/10" allow="autoplay; encrypted-media" />
            </div>
            <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
              <button onClick={() => setTranslated((value) => !value)} className="mb-2 flex items-center gap-1.5 rounded border border-white/10 px-2 py-1 text-xs text-white/70"><Languages size={14} />Lyrics translation</button>
              <p className="font-serif-accent text-2xl text-white/82">{translated ? translatedLyric : active.lyric}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
