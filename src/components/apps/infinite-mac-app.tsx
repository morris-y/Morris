'use client'

import { useState } from 'react'
import { ExternalLink, Monitor, Power, RotateCcw } from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

const systems = [
  { name: 'System 1.0', url: 'https://infinitemac.org/1984/System%201.0' },
  { name: 'System 7.5.3', url: 'https://infinitemac.org/1996/System%207.5.3' },
  { name: 'Mac OS 9.2.2', url: 'https://infinitemac.org/2002/Mac%20OS%209.2.2' },
  { name: 'Mac OS X 10.4', url: 'https://infinitemac.org/2005/Mac%20OS%20X%2010.4' },
]

export function InfiniteMacApp(_: AppWindowProps) {
  const [system, setSystem] = useState(systems[1])
  const [key, setKey] = useState(0)
  const [powered, setPowered] = useState(true)

  return (
    <div className="flex h-full flex-col bg-[#060706] text-white">
      <header className="flex items-center justify-between border-b border-white/10 bg-black/35 px-3 py-2">
        <div className="flex items-center gap-2">
          <Monitor size={17} className="text-[#d7ff2f]" />
          <select
            value={system.name}
            onChange={(event) => {
              setSystem(systems.find((item) => item.name === event.target.value) ?? systems[0])
              setKey((value) => value + 1)
              setPowered(true)
            }}
            className="rounded border border-white/10 bg-black px-2 py-1 text-sm outline-none"
          >
            {systems.map((item) => <option key={item.name}>{item.name}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <a href={system.url} target="_blank" rel="noreferrer" className="rounded border border-white/10 p-1.5 text-white/65 hover:bg-white/10" aria-label="Open Infinite Mac">
            <ExternalLink size={15} />
          </a>
          <button onClick={() => setKey((value) => value + 1)} className="rounded border border-white/10 p-1.5 text-white/65 hover:bg-white/10" aria-label="Restart">
            <RotateCcw size={15} />
          </button>
          <button onClick={() => setPowered((value) => !value)} className="rounded border border-white/10 p-1.5 text-white/65 hover:bg-white/10" aria-label="Power">
            <Power size={15} />
          </button>
        </div>
      </header>
      <div className="flex-1 bg-[radial-gradient(circle_at_center,rgba(215,255,47,.09),transparent_42%),#0b0c0b] p-4">
        <div className="mx-auto flex h-full max-w-5xl flex-col rounded-[18px] border border-white/12 bg-[#151515] p-3 shadow-2xl">
          <div className="mb-3 flex items-center justify-between rounded bg-[#d8d2bf] px-3 py-2 font-mono text-xs text-black">
            <span>Infinite Mac bridge: {system.name}</span>
            <span>{powered ? 'running' : 'sleep'}</span>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden rounded border-[10px] border-black bg-black">
            {powered ? (
              <iframe
                key={`${system.name}-${key}`}
                title={system.name}
                src={system.url}
                className="h-full w-full"
                allow="clipboard-read; clipboard-write; fullscreen"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-black font-mono text-[#d7ff2f]">It is now safe to dream again.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
