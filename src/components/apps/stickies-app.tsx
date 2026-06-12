'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  Bell,
  BellRing,
  CheckCircle2,
  Circle,
  Clock3,
  Palette,
  Pin,
  PinOff,
  Plus,
  Search,
  Trash2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppWindowProps } from '@/types/window'

type StickyColor = 'sun' | 'mint' | 'sky' | 'rose' | 'lavender'
type StickyFilter = 'open' | 'all' | 'done'

interface StickyNote {
  id: string
  title: string
  body: string
  color: StickyColor
  pinned: boolean
  completed: boolean
  reminderAt: string
  createdAt: string
  updatedAt: string
}

const STORAGE_KEY = 'morris-stickies-v1'

const COLOR_META: Record<StickyColor, { label: string; card: string; chip: string; ink: string }> = {
  sun: {
    label: 'Sun',
    card: 'bg-[#ffe88f] text-[#342b0a] border-[#d6b73c]',
    chip: 'bg-[#ffe88f]',
    ink: 'text-[#5b4810]',
  },
  mint: {
    label: 'Mint',
    card: 'bg-[#bff3d0] text-[#173521] border-[#78c891]',
    chip: 'bg-[#bff3d0]',
    ink: 'text-[#1f5231]',
  },
  sky: {
    label: 'Sky',
    card: 'bg-[#bfe4ff] text-[#102c42] border-[#74b5df]',
    chip: 'bg-[#bfe4ff]',
    ink: 'text-[#194b6b]',
  },
  rose: {
    label: 'Rose',
    card: 'bg-[#ffc5d5] text-[#461623] border-[#de7f99]',
    chip: 'bg-[#ffc5d5]',
    ink: 'text-[#74273c]',
  },
  lavender: {
    label: 'Lavender',
    card: 'bg-[#d8ccff] text-[#24164a] border-[#9c86da]',
    chip: 'bg-[#d8ccff]',
    ink: 'text-[#432d83]',
  },
}

const STARTER_NOTES: StickyNote[] = [
  {
    id: 'launch',
    title: 'Launch polish',
    body: 'Check finder preview states and TextEdit slash command affordance.',
    color: 'sun',
    pinned: true,
    completed: false,
    reminderAt: '',
    createdAt: '2026-06-12T08:00:00',
    updatedAt: '2026-06-12T08:00:00',
  },
  {
    id: 'content',
    title: 'Content pass',
    body: 'Trim copy until each app feels useful on the first glance.',
    color: 'mint',
    pinned: false,
    completed: false,
    reminderAt: '2026-06-14T09:00',
    createdAt: '2026-06-11T13:20:00',
    updatedAt: '2026-06-11T13:20:00',
  },
  {
    id: 'done',
    title: 'Local state',
    body: 'Stickies should survive refreshes without touching global stores.',
    color: 'lavender',
    pinned: false,
    completed: true,
    reminderAt: '',
    createdAt: '2026-06-10T17:12:00',
    updatedAt: '2026-06-10T18:00:00',
  },
]

function nowIso() {
  return new Date().toISOString()
}

function createBlankNote(): StickyNote {
  return {
    id: `sticky-${Date.now()}`,
    title: 'New sticky',
    body: '',
    color: 'sun',
    pinned: false,
    completed: false,
    reminderAt: '',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  }
}

function formatUpdated(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  )
}

function reminderLabel(value: string) {
  if (!value) return 'No reminder'
  const date = new Date(value)
  const diff = date.getTime() - Date.now()
  if (diff < 0) return `Due ${formatUpdated(value)}`
  if (diff < 1000 * 60 * 60 * 24) return `Today ${new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(date)}`
  return formatUpdated(value)
}

function readStoredNotes() {
  if (typeof window === 'undefined') return STARTER_NOTES
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return STARTER_NOTES
    const parsed = JSON.parse(raw) as StickyNote[]
    if (!Array.isArray(parsed)) return STARTER_NOTES
    return parsed
  } catch {
    return STARTER_NOTES
  }
}

export function StickiesApp({}: AppWindowProps) {
  const [notes, setNotes] = useState<StickyNote[]>(STARTER_NOTES)
  const [selectedId, setSelectedId] = useState(STARTER_NOTES[0]?.id ?? '')
  const [filter, setFilter] = useState<StickyFilter>('open')
  const [query, setQuery] = useState('')
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const stored = readStoredNotes()
    setNotes(stored)
    setSelectedId(stored[0]?.id ?? '')
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes))
  }, [hydrated, notes])

  const filteredNotes = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return notes
      .filter((note) => {
        const filterMatch = filter === 'all' || (filter === 'done' ? note.completed : !note.completed)
        const queryMatch =
          normalized.length === 0 ||
          note.title.toLowerCase().includes(normalized) ||
          note.body.toLowerCase().includes(normalized)
        return filterMatch && queryMatch
      })
      .sort((a, b) => Number(b.pinned) - Number(a.pinned) || +new Date(b.updatedAt) - +new Date(a.updatedAt))
  }, [filter, notes, query])

  const selected = notes.find((note) => note.id === selectedId) ?? filteredNotes[0] ?? notes[0]
  const dueCount = notes.filter((note) => note.reminderAt && !note.completed && new Date(note.reminderAt).getTime() <= Date.now()).length

  const patchNote = (id: string, patch: Partial<StickyNote>) => {
    setNotes((current) =>
      current.map((note) => (note.id === id ? { ...note, ...patch, updatedAt: nowIso() } : note)),
    )
  }

  const addNote = () => {
    const next = createBlankNote()
    setNotes((current) => [next, ...current])
    setSelectedId(next.id)
    setFilter('all')
  }

  const deleteNote = (id: string) => {
    const nextNotes = notes.filter((note) => note.id !== id)
    setNotes(nextNotes)
    if (selectedId === id) setSelectedId(nextNotes[0]?.id ?? '')
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1e1d1a] text-white">
      <aside className="hidden w-64 shrink-0 border-r border-white/[0.08] bg-[#292722] p-3 sm:flex sm:flex-col">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Stickies</p>
            <p className="mt-1 text-xs text-white/45">{notes.length} saved locally</p>
          </div>
          <button
            type="button"
            aria-label="New sticky"
            onClick={addNote}
            className="rounded-md bg-amber-300 px-2 py-1 text-[#34260a] shadow-sm hover:bg-amber-200"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 flex items-center rounded-md border border-white/[0.08] bg-black/18 px-2 py-1">
          <Search className="h-3.5 w-3.5 shrink-0 text-white/32" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes"
            className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white/75 outline-none placeholder:text-white/28"
          />
        </div>

        <div className="mb-3 grid grid-cols-3 rounded-md border border-white/[0.08] bg-black/18 p-0.5">
          {(['open', 'all', 'done'] as StickyFilter[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={cn(
                'rounded px-2 py-1 text-[11px] capitalize text-white/42 transition-colors',
                filter === item && 'bg-white/12 text-white',
              )}
            >
              {item}
            </button>
          ))}
        </div>

        {dueCount > 0 ? (
          <div className="mb-3 flex items-center gap-2 rounded-lg border border-red-300/20 bg-red-500/10 px-3 py-2 text-xs text-red-100">
            <BellRing className="h-4 w-4" />
            {dueCount} reminder{dueCount === 1 ? '' : 's'} due
          </div>
        ) : null}

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
          {filteredNotes.map((note) => (
            <button
              key={note.id}
              type="button"
              onClick={() => setSelectedId(note.id)}
              className={cn(
                'w-full rounded-lg border p-3 text-left shadow-sm transition-transform hover:-translate-y-0.5',
                COLOR_META[note.color].card,
                selected?.id === note.id ? 'ring-2 ring-white/45' : 'ring-0',
                note.completed && 'opacity-60',
              )}
            >
              <span className="flex items-start gap-2">
                {note.pinned ? <Pin className="mt-0.5 h-3.5 w-3.5 shrink-0" /> : null}
                <span className={cn('min-w-0 flex-1 truncate text-sm font-semibold', note.completed && 'line-through')}>
                  {note.title}
                </span>
              </span>
              <span className="mt-1 line-clamp-2 text-xs leading-snug opacity-75">{note.body || 'Empty sticky'}</span>
              <span className="mt-2 flex items-center gap-1 text-[10px] opacity-60">
                <Clock3 className="h-3 w-3" />
                {formatUpdated(note.updatedAt)}
              </span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.08] bg-[#24221e] px-3 py-2">
          <button
            type="button"
            onClick={addNote}
            className="flex items-center gap-1.5 rounded-md bg-amber-300 px-2.5 py-1.5 text-xs font-medium text-[#34260a] hover:bg-amber-200 sm:hidden"
          >
            <Plus className="h-3.5 w-3.5" />
            New
          </button>
          <div className="flex min-w-0 items-center gap-2">
            <Bell className="h-4 w-4 text-amber-200" />
            <span className="truncate text-sm font-semibold text-white/82">Sticky reminders</span>
          </div>
          <div className="ml-auto flex items-center gap-1 text-[10px] text-white/35">
            <span>{notes.filter((note) => !note.completed).length} open</span>
            <span className="text-white/16">/</span>
            <span>{notes.filter((note) => note.completed).length} done</span>
          </div>
        </header>

        {selected ? (
          <section className="min-h-0 flex-1 overflow-y-auto p-4">
            <div className={cn('mx-auto flex min-h-[420px] max-w-2xl flex-col rounded-xl border p-4 shadow-2xl', COLOR_META[selected.color].card)}>
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  aria-label={selected.completed ? 'Mark open' : 'Mark done'}
                  onClick={() => patchNote(selected.id, { completed: !selected.completed })}
                  className="rounded-md p-1 hover:bg-black/10"
                >
                  {selected.completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                </button>
                <input
                  value={selected.title}
                  onChange={(event) => patchNote(selected.id, { title: event.target.value })}
                  className={cn(
                    'min-w-0 flex-1 bg-transparent text-lg font-bold outline-none placeholder:text-black/35',
                    selected.completed && 'line-through opacity-65',
                  )}
                  placeholder="Sticky title"
                />
                <button
                  type="button"
                  aria-label={selected.pinned ? 'Unpin note' : 'Pin note'}
                  onClick={() => patchNote(selected.id, { pinned: !selected.pinned })}
                  className="rounded-md p-1.5 hover:bg-black/10"
                >
                  {selected.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                </button>
                <button
                  type="button"
                  aria-label="Delete sticky"
                  onClick={() => deleteNote(selected.id)}
                  className="rounded-md p-1.5 hover:bg-black/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <textarea
                value={selected.body}
                onChange={(event) => patchNote(selected.id, { body: event.target.value })}
                placeholder="Write a note..."
                className={cn(
                  'min-h-56 flex-1 resize-none bg-transparent text-[15px] leading-7 outline-none placeholder:text-black/35',
                  selected.completed && 'opacity-65',
                )}
              />

              <div className="mt-4 border-t border-black/15 pt-3">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-semibold opacity-70">
                    <Palette className="h-3.5 w-3.5" />
                    Color
                  </span>
                  {(Object.keys(COLOR_META) as StickyColor[]).map((color) => (
                    <button
                      key={color}
                      type="button"
                      aria-label={COLOR_META[color].label}
                      onClick={() => patchNote(selected.id, { color })}
                      className={cn(
                        'h-6 w-6 rounded-full border border-black/20 transition-transform hover:scale-105',
                        COLOR_META[color].chip,
                        selected.color === color && 'ring-2 ring-black/35 ring-offset-2 ring-offset-transparent',
                      )}
                    />
                  ))}
                </div>

                <label className="flex flex-wrap items-center gap-2 text-xs font-semibold opacity-75">
                  <Bell className="h-3.5 w-3.5" />
                  Reminder
                  <input
                    type="datetime-local"
                    value={selected.reminderAt}
                    onChange={(event) => patchNote(selected.id, { reminderAt: event.target.value })}
                    className="min-w-52 rounded-md border border-black/15 bg-white/40 px-2 py-1 text-xs outline-none focus:bg-white/70"
                  />
                  <span className={cn('font-normal', selected.reminderAt && new Date(selected.reminderAt).getTime() <= Date.now() && 'font-semibold text-red-700')}>
                    {reminderLabel(selected.reminderAt)}
                  </span>
                </label>
              </div>
            </div>
          </section>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-white/45">No sticky selected</div>
        )}
      </main>
    </div>
  )
}
