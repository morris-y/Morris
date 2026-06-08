'use client'

import { useEffect, useState } from 'react'
import type { NoteFolder } from '@/lib/notes'
import type { AppWindowProps } from '@/types/window'
import { NotesLayout } from '@/components/notes/notes-layout'

type FetchState =
  | { status: 'loading' }
  | { status: 'success'; folders: NoteFolder[] }
  | { status: 'error'; message: string }

export function NotesApp(_props: AppWindowProps) {
  const [state, setState] = useState<FetchState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    fetch('/api/notes')
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json() as Promise<NoteFolder[]>
      })
      .then((folders) => {
        if (!cancelled) setState({ status: 'success', folders })
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setState({ status: 'error', message: err instanceof Error ? err.message : 'Unknown error' })
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (state.status === 'loading') {
    return (
      <div className="flex h-full w-full bg-[#1e1e1e]">
        {/* Sidebar skeleton */}
        <div className="w-48 shrink-0 bg-[#2c2c2e] border-r border-black/30 flex flex-col gap-2 px-4 pt-12 pb-4">
          <div className="h-2 w-16 rounded bg-white/10 mb-6 animate-pulse" />
          {[80, 60, 72, 55].map((w, i) => (
            <div
              key={i}
              className="h-8 rounded-lg bg-white/5 animate-pulse"
              style={{ width: `${w}%`, animationDelay: `${i * 80}ms` }}
            />
          ))}
        </div>

        {/* Note list skeleton */}
        <div className="w-64 shrink-0 bg-[#2c2c2e] border-r border-black/30 flex flex-col gap-2 px-4 pt-12 pb-4">
          <div className="h-2 w-20 rounded bg-white/10 mb-4 animate-pulse" />
          {[90, 75, 85, 65, 80].map((w, i) => (
            <div
              key={i}
              className="flex flex-col gap-1.5 px-1 py-2"
            >
              <div
                className="h-3 rounded bg-white/10 animate-pulse"
                style={{ width: `${w}%`, animationDelay: `${i * 60}ms` }}
              />
              <div
                className="h-2 rounded bg-white/5 animate-pulse"
                style={{ width: '40%', animationDelay: `${i * 60 + 30}ms` }}
              />
            </div>
          ))}
        </div>

        {/* Content area skeleton — centered spinner */}
        <div className="flex-1 flex items-center justify-center bg-[#1e1e1e]">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 rounded-full border-2 border-[#d4a036]/40 border-t-[#d4a036] animate-spin" />
            <span className="text-white/20 text-xs tracking-widest uppercase">loading</span>
          </div>
        </div>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#1e1e1e]">
        <div className="flex flex-col items-center gap-2 text-center px-6">
          <span className="text-2xl select-none">📋</span>
          <p className="text-white/50 text-sm">could not load notes</p>
          <p className="text-white/20 text-xs font-mono">{state.message}</p>
        </div>
      </div>
    )
  }

  return <NotesLayout folders={state.folders} isWindowed={true} />
}
