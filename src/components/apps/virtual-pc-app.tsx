'use client'

import { useMemo, useState } from 'react'
import { Disc3, Gamepad2, HardDrive, Keyboard, Play, RotateCcw, Save } from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

const games = [
  { id: 'doom', title: 'Doom Shareware', disk: 'A:\\DOOM', ram: '8 MB', note: 'Fast 486 profile with Sound Blaster 16' },
  { id: 'simcity', title: 'SimCity Classic', disk: 'C:\\MAXIS\\SIMCITY', ram: '4 MB', note: 'Mouse-driven city sandbox profile' },
  { id: 'keen', title: 'Commander Keen', disk: 'A:\\KEEN', ram: '2 MB', note: 'VGA platformer boot preset' },
]

export function VirtualPcApp(_: AppWindowProps) {
  const [selected, setSelected] = useState(games[0])
  const [booted, setBooted] = useState(false)
  const [line, setLine] = useState('C:\\>')
  const bootLog = useMemo(
    () => [
      'Morris Virtual PC BIOS 4.86',
      'Detecting IDE Primary Master... QUANTUM_FIREBALL_540',
      `Mounting ${selected.disk}`,
      `Loading ${selected.title.toUpperCase()} profile`,
      'MSCDEX ready. Mouse driver ready. Network bridge disabled.',
    ],
    [selected]
  )

  return (
    <div className="grid h-full grid-cols-[250px_1fr] bg-[#080908] text-white">
      <aside className="border-r border-white/10 bg-black/40 p-3">
        <div className="mb-3 flex items-center gap-2">
          <HardDrive className="text-[#d7ff2f]" size={18} />
          <div>
            <p className="font-mono text-[10px] uppercase text-white/40">Virtual PC</p>
            <h2 className="font-display text-2xl leading-none">DOS Bay</h2>
          </div>
        </div>
        <div className="space-y-2">
          {games.map((game) => (
            <button
              key={game.id}
              onClick={() => {
                setSelected(game)
                setBooted(false)
              }}
              className={`w-full rounded-lg border p-3 text-left ${selected.id === game.id ? 'border-[#d7ff2f]/45 bg-[#d7ff2f]/10' : 'border-white/10 bg-white/[0.04] hover:bg-white/[0.08]'}`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold"><Disc3 size={15} />{game.title}</span>
              <span className="mt-1 block text-xs text-white/42">{game.note}</span>
            </button>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-center font-mono text-[10px] uppercase text-white/45">
          <div className="rounded border border-white/10 bg-white/[0.035] p-2">CPU<br /><span className="text-white/80">486 DX2</span></div>
          <div className="rounded border border-white/10 bg-white/[0.035] p-2">RAM<br /><span className="text-white/80">{selected.ram}</span></div>
        </div>
      </aside>

      <section className="flex min-w-0 flex-col">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase text-white/45">
            <Gamepad2 size={15} /> {selected.disk}
          </div>
          <div className="flex gap-2">
            <button onClick={() => setBooted(true)} className="flex items-center gap-1.5 rounded bg-[#d7ff2f] px-3 py-1.5 text-xs font-semibold text-black"><Play size={14} />Boot</button>
            <button onClick={() => setBooted(false)} className="rounded border border-white/10 px-2 py-1.5 text-white/60 hover:bg-white/10" aria-label="Reset"><RotateCcw size={15} /></button>
            <button className="rounded border border-white/10 px-2 py-1.5 text-white/60 hover:bg-white/10" aria-label="Save state"><Save size={15} /></button>
          </div>
        </div>
        <div className="flex-1 bg-[#020302] p-4 font-mono text-sm text-[#31ff77]">
          <div className="h-full rounded border border-[#31ff77]/25 bg-[radial-gradient(circle_at_50%_20%,rgba(49,255,119,.13),transparent_34%),#020302] p-4 shadow-[inset_0_0_60px_rgba(49,255,119,.08)]">
            {booted ? (
              <>
                {bootLog.map((item) => <p key={item}>{item}</p>)}
                <p className="mt-4 text-white/70">Type RUN to launch, DIR to inspect disk, or HELP for controls.</p>
                <div className="mt-3 flex items-center gap-2">
                  <span>{line}</span>
                  <input
                    value=""
                    onChange={() => undefined}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') setLine(`${line} ${selected.title.toUpperCase()} READY>`)
                    }}
                    className="flex-1 bg-transparent outline-none"
                    aria-label="DOS command"
                    autoFocus
                  />
                </div>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Keyboard size={42} className="mb-3 text-[#d7ff2f]" />
                <p className="text-lg text-[#d7ff2f]">Insert a disk and press Boot</p>
                <p className="mt-2 max-w-md text-xs leading-5 text-white/45">This is a browser-safe DOS front-end shell prepared for js-dos style integration. Presets, save slots, and game controls are already modeled.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
