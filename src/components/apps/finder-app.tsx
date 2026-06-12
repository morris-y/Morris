'use client'

import { useMemo, useState } from 'react'
import {
  Archive,
  ChevronRight,
  Clock3,
  Code2,
  Database,
  File,
  FileText,
  Folder,
  HardDrive,
  Image,
  LayoutGrid,
  List,
  Music,
  Search,
  Star,
  Tag,
  Video,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppWindowProps } from '@/types/window'

type FileKind = 'folder' | 'document' | 'image' | 'code' | 'audio' | 'video' | 'archive' | 'data'
type FinderSection = 'all' | 'recents' | 'starred' | 'documents' | 'media' | 'code'
type ViewMode = 'list' | 'grid'

interface FinderItem {
  id: string
  name: string
  kind: FileKind
  location: string
  sizeMb: number
  modified: string
  tags: string[]
  starred?: boolean
  contents?: string
  dimensions?: string
}

const ITEMS: FinderItem[] = [
  {
    id: 'portfolio',
    name: 'Morris Portfolio',
    kind: 'folder',
    location: 'iCloud Drive / Projects',
    sizeMb: 184,
    modified: '2026-06-12T15:42:00',
    tags: ['work', 'next.js', 'active'],
    starred: true,
    contents: 'Current portfolio workspace with app shells, desktop interactions, and content modules.',
  },
  {
    id: 'strategy',
    name: 'AI product strategy.md',
    kind: 'document',
    location: 'Documents / Writing',
    sizeMb: 1.8,
    modified: '2026-06-11T20:18:00',
    tags: ['writing', 'research'],
    starred: true,
    contents:
      '# AI product strategy\n\n- Clarify the smallest lovable workflow\n- Measure retention before adding breadth\n- Design around human review moments',
  },
  {
    id: 'hubble',
    name: 'hubble-agent-flow.ts',
    kind: 'code',
    location: 'Projects / Hubble',
    sizeMb: 0.36,
    modified: '2026-06-10T09:24:00',
    tags: ['typescript', 'agent'],
    contents:
      'export async function runAgentFlow(input: Task) {\n  const plan = await planner.create(input)\n  return executor.run(plan)\n}',
  },
  {
    id: 'market',
    name: 'prediction-market-data.csv',
    kind: 'data',
    location: 'Downloads',
    sizeMb: 28.4,
    modified: '2026-06-08T17:05:00',
    tags: ['data', 'markets'],
    contents: 'question,probability,volume\nWill BTC close above 120k?,0.42,184203\nFed cut by Sep?,0.61,94231',
  },
  {
    id: 'deck',
    name: 'investor-narrative.pages',
    kind: 'document',
    location: 'Documents / Decks',
    sizeMb: 12.7,
    modified: '2026-06-05T11:10:00',
    tags: ['deck', 'fundraising'],
    contents: 'Narrative draft, customer proof, traction, roadmap, and partner asks.',
  },
  {
    id: 'screenshot',
    name: 'desktop-redesign-shot.png',
    kind: 'image',
    location: 'Pictures / Screenshots',
    sizeMb: 4.9,
    modified: '2026-06-03T22:31:00',
    tags: ['design', 'screenshot'],
    dimensions: '2880 x 1800',
    contents: 'High-resolution screenshot of the macOS-inspired portfolio desktop.',
  },
  {
    id: 'demo',
    name: 'terminal-demo.mov',
    kind: 'video',
    location: 'Movies',
    sizeMb: 146.2,
    modified: '2026-05-30T13:19:00',
    tags: ['demo', 'video'],
    dimensions: '1920 x 1080',
    contents: 'Short product demo capturing terminal boot sequence and command interactions.',
  },
  {
    id: 'audio',
    name: 'voice-note-ideas.m4a',
    kind: 'audio',
    location: 'iCloud Drive / Voice Memos',
    sizeMb: 7.3,
    modified: '2026-05-26T08:44:00',
    tags: ['voice', 'ideas'],
    contents: 'Brainstorm: tighter dock motion, smarter search, and a stronger first-launch moment.',
  },
  {
    id: 'archive',
    name: 'launch-assets.zip',
    kind: 'archive',
    location: 'Downloads',
    sizeMb: 88.9,
    modified: '2026-05-18T18:52:00',
    tags: ['assets', 'launch'],
    contents: 'Compressed brand images, launch copy, thumbnails, and exported icons.',
  },
]

const SECTION_LABELS: Record<FinderSection, string> = {
  all: 'All Files',
  recents: 'Recents',
  starred: 'Starred',
  documents: 'Documents',
  media: 'Media',
  code: 'Code',
}

const KIND_META: Record<FileKind, { label: string; icon: LucideIcon; color: string; bg: string }> = {
  folder: { label: 'Folder', icon: Folder, color: 'text-sky-300', bg: 'bg-sky-500/15' },
  document: { label: 'Document', icon: FileText, color: 'text-stone-200', bg: 'bg-white/10' },
  image: { label: 'Image', icon: Image, color: 'text-emerald-300', bg: 'bg-emerald-500/15' },
  code: { label: 'Code', icon: Code2, color: 'text-violet-300', bg: 'bg-violet-500/15' },
  audio: { label: 'Audio', icon: Music, color: 'text-pink-300', bg: 'bg-pink-500/15' },
  video: { label: 'Video', icon: Video, color: 'text-red-300', bg: 'bg-red-500/15' },
  archive: { label: 'Archive', icon: Archive, color: 'text-amber-300', bg: 'bg-amber-500/15' },
  data: { label: 'Data', icon: Database, color: 'text-cyan-300', bg: 'bg-cyan-500/15' },
}

const SECTION_RULES: Record<FinderSection, (item: FinderItem) => boolean> = {
  all: () => true,
  recents: (item) => Date.now() - new Date(item.modified).getTime() < 1000 * 60 * 60 * 24 * 10,
  starred: (item) => Boolean(item.starred),
  documents: (item) => item.kind === 'document' || item.kind === 'data',
  media: (item) => item.kind === 'image' || item.kind === 'audio' || item.kind === 'video',
  code: (item) => item.kind === 'code',
}

function formatSize(sizeMb: number) {
  if (sizeMb >= 1024) return `${(sizeMb / 1024).toFixed(1)} GB`
  if (sizeMb >= 10) return `${sizeMb.toFixed(0)} MB`
  return `${sizeMb.toFixed(1)} MB`
}

function formatModified(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  )
}

function smartReason(item: FinderItem) {
  if (item.starred) return 'Pinned by usage'
  if (item.tags.includes('active')) return 'Active project'
  if (item.kind === 'code') return 'Developer file'
  if (item.kind === 'data') return 'Structured data'
  if (item.kind === 'image' || item.kind === 'video') return 'Visual media'
  return 'Matched by metadata'
}

export function FinderApp({}: AppWindowProps) {
  const [section, setSection] = useState<FinderSection>('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(ITEMS[0]?.id ?? '')
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const filteredItems = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return ITEMS.filter((item) => {
      const sectionMatch = SECTION_RULES[section](item)
      const queryMatch =
        normalized.length === 0 ||
        [item.name, item.location, item.kind, ...item.tags].some((value) => value.toLowerCase().includes(normalized))
      return sectionMatch && queryMatch
    }).sort((a, b) => Number(Boolean(b.starred)) - Number(Boolean(a.starred)) || +new Date(b.modified) - +new Date(a.modified))
  }, [query, section])

  const selected = filteredItems.find((item) => item.id === selectedId) ?? filteredItems[0] ?? ITEMS[0]
  const usedStorage = ITEMS.reduce((sum, item) => sum + item.sizeMb, 0)
  const totalStorage = 512 * 1024
  const storagePercent = Math.min(100, (usedStorage / totalStorage) * 100)

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#19191b] text-white">
      <aside className="hidden w-52 shrink-0 border-r border-white/[0.08] bg-[#252528] px-3 py-4 sm:flex sm:flex-col">
        <div className="mb-4 px-2">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Quick Access</p>
        </div>
        <nav className="space-y-1">
          {(Object.keys(SECTION_LABELS) as FinderSection[]).map((key) => {
            const Icon = key === 'starred' ? Star : key === 'recents' ? Clock3 : key === 'code' ? Code2 : key === 'media' ? Image : key === 'documents' ? FileText : Folder
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSection(key)}
                className={cn(
                  'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-xs transition-colors',
                  section === key ? 'bg-white/12 text-white' : 'text-white/55 hover:bg-white/[0.07] hover:text-white/85',
                )}
              >
                <Icon className="h-3.5 w-3.5 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{SECTION_LABELS[key]}</span>
                <span className="text-[10px] text-white/28">{ITEMS.filter(SECTION_RULES[key]).length}</span>
              </button>
            )
          })}
        </nav>

        <div className="mt-auto rounded-lg border border-white/[0.07] bg-black/18 p-3">
          <div className="mb-2 flex items-center gap-2 text-xs text-white/70">
            <HardDrive className="h-3.5 w-3.5" />
            <span>Macintosh HD</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-sky-400" style={{ width: `${Math.max(6, storagePercent)}%` }} />
          </div>
          <p className="mt-2 text-[10px] leading-tight text-white/35">
            {formatSize(usedStorage)} of 512 GB used in this view
          </p>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.08] bg-[#202023] px-3 py-2">
          <div className="flex min-w-0 items-center gap-1 text-sm text-white/65">
            <Folder className="h-4 w-4 text-sky-300" />
            <ChevronRight className="h-3.5 w-3.5 text-white/25" />
            <span className="truncate font-medium text-white/85">{SECTION_LABELS[section]}</span>
          </div>
          <div className="ml-auto flex min-w-[180px] flex-1 items-center rounded-md border border-white/[0.08] bg-black/20 px-2 py-1 sm:max-w-xs">
            <Search className="h-3.5 w-3.5 shrink-0 text-white/35" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search files, tags, locations"
              className="min-w-0 flex-1 bg-transparent px-2 text-xs text-white/80 outline-none placeholder:text-white/28"
            />
          </div>
          <div className="flex rounded-md border border-white/[0.08] bg-black/18 p-0.5">
            <button
              type="button"
              aria-label="List view"
              onClick={() => setViewMode('list')}
              className={cn('rounded px-2 py-1 text-white/45 transition-colors', viewMode === 'list' && 'bg-white/12 text-white')}
            >
              <List className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label="Grid view"
              onClick={() => setViewMode('grid')}
              className={cn('rounded px-2 py-1 text-white/45 transition-colors', viewMode === 'grid' && 'bg-white/12 text-white')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1">
          <section className="min-w-0 flex-1 overflow-y-auto p-3">
            {filteredItems.length === 0 ? (
              <div className="flex h-full min-h-60 items-center justify-center text-center">
                <div>
                  <Search className="mx-auto mb-3 h-7 w-7 text-white/18" />
                  <p className="text-sm text-white/55">No files matched your search.</p>
                  <p className="mt-1 text-xs text-white/28">Try a tag like design, agent, or data.</p>
                </div>
              </div>
            ) : viewMode === 'list' ? (
              <div className="overflow-hidden rounded-lg border border-white/[0.07]">
                <div className="grid grid-cols-[minmax(180px,1fr)_90px_120px] gap-3 bg-white/[0.04] px-3 py-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
                  <span>Name</span>
                  <span>Size</span>
                  <span className="hidden sm:block">Modified</span>
                </div>
                {filteredItems.map((item) => (
                  <FinderRow key={item.id} item={item} selected={item.id === selected.id} onSelect={() => setSelectedId(item.id)} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {filteredItems.map((item) => (
                  <FinderTile key={item.id} item={item} selected={item.id === selected.id} onSelect={() => setSelectedId(item.id)} />
                ))}
              </div>
            )}
          </section>

          <aside className="hidden w-72 shrink-0 border-l border-white/[0.08] bg-[#222225] p-4 md:block">
            <PreviewPanel item={selected} />
          </aside>
        </div>
      </main>
    </div>
  )
}

function FinderIcon({ item, className }: { item: FinderItem; className?: string }) {
  const meta = KIND_META[item.kind]
  const Icon = meta.icon
  return (
    <span className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', meta.bg, meta.color, className)}>
      <Icon className="h-4 w-4" />
    </span>
  )
}

function FinderRow({ item, selected, onSelect }: { item: FinderItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'grid w-full grid-cols-[minmax(180px,1fr)_90px_120px] items-center gap-3 border-t border-white/[0.06] px-3 py-2 text-left transition-colors',
        selected ? 'bg-sky-500/18' : 'hover:bg-white/[0.05]',
      )}
    >
      <span className="flex min-w-0 items-center gap-3">
        <FinderIcon item={item} />
        <span className="min-w-0">
          <span className="block truncate text-xs font-medium text-white/86">{item.name}</span>
          <span className="block truncate text-[10px] text-white/35">{item.location}</span>
        </span>
      </span>
      <span className="text-xs text-white/45">{formatSize(item.sizeMb)}</span>
      <span className="hidden text-xs text-white/45 sm:block">{formatModified(item.modified)}</span>
    </button>
  )
}

function FinderTile({ item, selected, onSelect }: { item: FinderItem; selected: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex min-h-32 flex-col items-center justify-center rounded-lg border p-3 text-center transition-colors',
        selected ? 'border-sky-400/45 bg-sky-500/14' : 'border-white/[0.07] bg-white/[0.035] hover:bg-white/[0.06]',
      )}
    >
      <FinderIcon item={item} className="mb-3 h-12 w-12 rounded-xl" />
      <span className="line-clamp-2 text-xs font-medium leading-snug text-white/86">{item.name}</span>
      <span className="mt-1 text-[10px] text-white/35">{formatSize(item.sizeMb)}</span>
    </button>
  )
}

function PreviewPanel({ item }: { item: FinderItem }) {
  const meta = KIND_META[item.kind]
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-col items-center border-b border-white/[0.07] pb-4 text-center">
        <FinderIcon item={item} className="h-16 w-16 rounded-2xl" />
        <h2 className="mt-3 line-clamp-2 text-sm font-semibold leading-snug text-white/90">{item.name}</h2>
        <p className="mt-1 text-xs text-white/38">{meta.label}</p>
      </div>

      <div className="space-y-4 overflow-y-auto py-4">
        <div>
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            <Tag className="h-3 w-3" />
            Smart Detection
          </div>
          <div className="rounded-lg border border-white/[0.07] bg-black/18 p-3">
            <p className="text-xs font-medium text-white/78">{smartReason(item)}</p>
            <p className="mt-1 text-[11px] leading-relaxed text-white/38">
              Finder matched this item by kind, tags, recency, and location metadata.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-[76px,1fr] gap-x-3 gap-y-2 text-xs">
          <dt className="text-white/32">Location</dt>
          <dd className="min-w-0 truncate text-white/68">{item.location}</dd>
          <dt className="text-white/32">Size</dt>
          <dd className="text-white/68">{formatSize(item.sizeMb)}</dd>
          <dt className="text-white/32">Modified</dt>
          <dd className="text-white/68">{formatModified(item.modified)}</dd>
          {item.dimensions ? (
            <>
              <dt className="text-white/32">Frame</dt>
              <dd className="text-white/68">{item.dimensions}</dd>
            </>
          ) : null}
        </dl>

        <div className="flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-white/[0.07] px-2 py-1 text-[10px] text-white/52">
              {tag}
            </span>
          ))}
        </div>

        <div className="rounded-lg border border-white/[0.07] bg-[#18181a] p-3">
          <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
            <File className="h-3 w-3" />
            Preview
          </div>
          <pre className="max-h-44 whitespace-pre-wrap break-words font-mono text-[11px] leading-relaxed text-white/58">
            {item.contents ?? 'No preview available.'}
          </pre>
        </div>
      </div>
    </div>
  )
}
