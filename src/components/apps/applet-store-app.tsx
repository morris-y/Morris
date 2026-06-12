'use client'

import { useMemo, useState } from 'react'
import { Code2, Download, Search, Share2, Store, Upload } from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

type Applet = { id: string; name: string; author: string; category: string; installs: number; html: string }

const catalog: Applet[] = [
  { id: 'clock', name: 'Flip Clock', author: 'community', category: 'utility', installs: 1240, html: '<div style="font:700 44px monospace;color:#d7ff2f;background:#050505;height:100%;display:grid;place-items:center">20:26</div>' },
  { id: 'ticker', name: 'Signal Ticker', author: 'morris', category: 'finance', installs: 880, html: '<marquee style="font:16px monospace;color:white;background:#111;padding:20px">PMKT +4.2% · AIOS +9.1% · TAIPEI SESSION OPEN</marquee>' },
  { id: 'haiku', name: 'Build Haiku', author: 'ryo', category: 'writing', installs: 512, html: '<main style="font-family:serif;background:#eee;color:#111;height:100%;padding:28px"><h1>Ship the small window</h1><p>Pixels learn the room by touch<br/>Night accepts the diff</p></main>' },
]

export function AppletStoreApp(_: AppWindowProps) {
  const [query, setQuery] = useState('')
  const [installed, setInstalled] = useState<string[]>(['clock'])
  const [selected, setSelected] = useState(catalog[0])
  const [customHtml, setCustomHtml] = useState('<button onclick="document.body.style.background=`#d7ff2f`">Wake applet</button>')
  const filtered = useMemo(() => catalog.filter((item) => `${item.name} ${item.category} ${item.author}`.toLowerCase().includes(query.toLowerCase())), [query])

  return (
    <div className="grid h-full grid-cols-[300px_1fr] bg-[#080908] text-white">
      <aside className="border-r border-white/10 bg-black/40 p-3">
        <div className="mb-3 flex items-center gap-2">
          <Store size={18} className="text-[#d7ff2f]" />
          <div>
            <p className="font-mono text-[10px] uppercase text-white/40">Applet Store</p>
            <h2 className="font-display text-2xl leading-none">Tiny HTML Bazaar</h2>
          </div>
        </div>
        <div className="mb-3 flex items-center gap-2 rounded border border-white/10 bg-white/[0.04] px-2">
          <Search size={15} className="text-white/35" />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search applets" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-white/28" />
        </div>
        <div className="space-y-2 overflow-y-auto">
          {filtered.map((applet) => (
            <button key={applet.id} onClick={() => setSelected(applet)} className={`w-full rounded-lg border p-3 text-left ${selected.id === applet.id ? 'border-[#d7ff2f]/45 bg-[#d7ff2f]/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'}`}>
              <span className="flex items-center justify-between text-sm font-semibold"><span>{applet.name}</span>{installed.includes(applet.id) ? <Download size={14} className="text-[#d7ff2f]" /> : null}</span>
              <span className="mt-1 block text-xs text-white/42">{applet.category} by {applet.author} · {applet.installs.toLocaleString()}</span>
            </button>
          ))}
        </div>
      </aside>
      <section className="grid min-w-0 grid-rows-[auto_1fr_150px]">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="font-display text-2xl leading-none">{selected.name}</h3>
            <p className="mt-1 text-xs text-white/45">Sandboxed HTML applet preview</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setInstalled((prev) => prev.includes(selected.id) ? prev : [...prev, selected.id])} className="flex items-center gap-1.5 rounded bg-[#d7ff2f] px-3 py-1.5 text-sm font-semibold text-black"><Download size={15} />Install</button>
            <button className="rounded border border-white/10 p-1.5 text-white/65 hover:bg-white/10" aria-label="Share"><Share2 size={15} /></button>
          </div>
        </header>
        <div className="min-h-0 p-4">
          <iframe title={selected.name} sandbox="allow-scripts" srcDoc={selected.html} className="h-full w-full rounded-lg border border-white/10 bg-white" />
        </div>
        <div className="border-t border-white/10 bg-black/35 p-3">
          <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase text-white/45"><Code2 size={14} /> Share a local applet draft</div>
          <div className="flex gap-2">
            <textarea value={customHtml} onChange={(event) => setCustomHtml(event.target.value)} className="h-20 min-w-0 flex-1 rounded border border-white/10 bg-white/[0.05] p-2 font-mono text-xs outline-none" />
            <button
              onClick={() => {
                const applet = { id: `custom-${Date.now()}`, name: 'Local Draft', author: 'you', category: 'draft', installs: 0, html: customHtml }
                catalog.unshift(applet)
                setSelected(applet)
              }}
              className="flex items-center gap-1.5 rounded border border-white/10 px-3 text-sm text-white/75 hover:bg-white/10"
            >
              <Upload size={15} />Preview
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
