'use client'

import { useMemo, useState, type ChangeEvent, type KeyboardEvent } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Bold,
  Eye,
  FilePlus2,
  Heading1,
  Italic,
  List,
  ListChecks,
  PanelLeftClose,
  PanelLeftOpen,
  Pilcrow,
  Quote,
  Save,
  Sparkles,
  SplitSquareHorizontal,
  Trash2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AppWindowProps } from '@/types/window'

interface TextDocument {
  id: string
  title: string
  body: string
  updatedAt: string
}

interface SlashCommand {
  id: string
  label: string
  icon: LucideIcon
  insert: string
}

const INITIAL_DOCS: TextDocument[] = [
  {
    id: 'draft',
    title: 'Draft.md',
    updatedAt: '2026-06-12T10:14:00',
    body:
      '# Product note\n\nThe best version of this desktop should feel quiet, capable, and a little cinematic.\n\n## Today\n\n- Tighten built-in app affordances\n- Keep every interaction local and fast\n- Make preview panes useful without feeling heavy\n\n> Good tools reduce the surface area between thought and action.',
  },
  {
    id: 'meeting',
    title: 'Meeting notes.txt',
    updatedAt: '2026-06-11T16:30:00',
    body:
      '# Working session\n\n## Decisions\n\n- Finder gets smart categorization and preview.\n- TextEdit uses tabs instead of spawning real windows.\n- Stickies persists notes locally.\n\n## Follow up\n\n- Wire these apps into the registry in a separate integration pass.',
  },
  {
    id: 'blank',
    title: 'Untitled',
    updatedAt: '2026-06-10T08:00:00',
    body: 'Start typing, or use /heading, /todo, /quote, /bold, and /italic.',
  },
]

const SLASH_COMMANDS: SlashCommand[] = [
  { id: 'heading', label: 'Heading', icon: Heading1, insert: '# ' },
  { id: 'todo', label: 'Checklist', icon: ListChecks, insert: '- [ ] ' },
  { id: 'bullet', label: 'Bullet list', icon: List, insert: '- ' },
  { id: 'quote', label: 'Quote', icon: Quote, insert: '> ' },
  { id: 'bold', label: 'Bold text', icon: Bold, insert: '**bold text**' },
  { id: 'italic', label: 'Italic text', icon: Italic, insert: '*italic text*' },
]

function nowIso() {
  return new Date().toISOString()
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(
    new Date(value),
  )
}

function wordCount(text: string) {
  return text.trim().length === 0 ? 0 : text.trim().split(/\s+/).length
}

function getSlashQuery(text: string, cursor: number | null) {
  if (cursor === null) return null
  const beforeCursor = text.slice(0, cursor)
  const lineStart = beforeCursor.lastIndexOf('\n') + 1
  const line = beforeCursor.slice(lineStart)
  if (!line.startsWith('/')) return null
  return { query: line.slice(1).toLowerCase(), start: lineStart, end: cursor }
}

function insertAroundSelection(text: string, start: number, end: number, left: string, right = left) {
  const selection = text.slice(start, end) || 'text'
  return `${text.slice(0, start)}${left}${selection}${right}${text.slice(end)}`
}

export function TextEditApp({}: AppWindowProps) {
  const [documents, setDocuments] = useState<TextDocument[]>(INITIAL_DOCS)
  const [activeId, setActiveId] = useState(INITIAL_DOCS[0]?.id ?? '')
  const [selection, setSelection] = useState({ start: 0, end: 0 })
  const [mode, setMode] = useState<'edit' | 'split' | 'preview'>('split')
  const [showLibrary, setShowLibrary] = useState(true)

  const activeDocument = documents.find((doc) => doc.id === activeId) ?? documents[0]
  const slash = activeDocument ? getSlashQuery(activeDocument.body, selection.start) : null
  const matchingCommands = slash
    ? SLASH_COMMANDS.filter((command) => command.id.includes(slash.query) || command.label.toLowerCase().includes(slash.query))
    : []

  const stats = useMemo(() => {
    const text = activeDocument?.body ?? ''
    return {
      words: wordCount(text),
      chars: text.length,
      lines: text.length === 0 ? 0 : text.split('\n').length,
    }
  }, [activeDocument?.body])

  const updateActiveDocument = (body: string) => {
    if (!activeDocument) return
    setDocuments((current) =>
      current.map((doc) => (doc.id === activeDocument.id ? { ...doc, body, updatedAt: nowIso() } : doc)),
    )
  }

  const renameActiveDocument = (title: string) => {
    if (!activeDocument) return
    setDocuments((current) =>
      current.map((doc) => (doc.id === activeDocument.id ? { ...doc, title: title.trim() || 'Untitled', updatedAt: nowIso() } : doc)),
    )
  }

  const createDocument = () => {
    const next: TextDocument = {
      id: `doc-${Date.now()}`,
      title: 'Untitled',
      body: '# Untitled\n\n',
      updatedAt: nowIso(),
    }
    setDocuments((current) => [next, ...current])
    setActiveId(next.id)
    setSelection({ start: next.body.length, end: next.body.length })
  }

  const deleteActiveDocument = () => {
    if (!activeDocument || documents.length <= 1) return
    const nextDocuments = documents.filter((doc) => doc.id !== activeDocument.id)
    setDocuments(nextDocuments)
    setActiveId(nextDocuments[0]?.id ?? '')
  }

  const applyCommand = (command: SlashCommand) => {
    if (!activeDocument || !slash) return
    const nextBody = `${activeDocument.body.slice(0, slash.start)}${command.insert}${activeDocument.body.slice(slash.end)}`
    updateActiveDocument(nextBody)
    const nextCursor = slash.start + command.insert.length
    setSelection({ start: nextCursor, end: nextCursor })
  }

  const wrapSelection = (left: string, right = left) => {
    if (!activeDocument) return
    const nextBody = insertAroundSelection(activeDocument.body, selection.start, selection.end, left, right)
    updateActiveDocument(nextBody)
  }

  const handleEditorChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    updateActiveDocument(event.target.value)
    setSelection({ start: event.target.selectionStart, end: event.target.selectionEnd })
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Tab') {
      event.preventDefault()
      if (!activeDocument) return
      const nextBody = `${activeDocument.body.slice(0, selection.start)}  ${activeDocument.body.slice(selection.end)}`
      updateActiveDocument(nextBody)
      const nextCursor = selection.start + 2
      setSelection({ start: nextCursor, end: nextCursor })
    }
    if (event.key === 'Enter' && matchingCommands.length > 0 && slash) {
      event.preventDefault()
      applyCommand(matchingCommands[0])
    }
  }

  if (!activeDocument) {
    return <div className="flex h-full w-full items-center justify-center bg-[#1f1f21] text-sm text-white/50">No document</div>
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#1d1d1f] text-white">
      <aside
        className={cn(
          'hidden shrink-0 border-r border-white/[0.08] bg-[#27272a] transition-[width] duration-150 sm:flex sm:flex-col',
          showLibrary ? 'w-56' : 'w-0 overflow-hidden border-r-0',
        )}
      >
        <div className="flex items-center justify-between px-3 pb-2 pt-4">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Documents</p>
          <button
            type="button"
            aria-label="New document"
            onClick={createDocument}
            className="rounded-md p-1 text-white/45 hover:bg-white/[0.08] hover:text-white/80"
          >
            <FilePlus2 className="h-4 w-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto px-2 pb-3">
          {documents.map((doc) => (
            <button
              key={doc.id}
              type="button"
              onClick={() => setActiveId(doc.id)}
              className={cn(
                'w-full rounded-lg px-3 py-2 text-left transition-colors',
                activeId === doc.id ? 'bg-white/12' : 'hover:bg-white/[0.06]',
              )}
            >
              <span className="block truncate text-xs font-medium text-white/82">{doc.title}</span>
              <span className="mt-1 block truncate text-[10px] text-white/32">{formatTime(doc.updatedAt)}</span>
            </button>
          ))}
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <header className="flex shrink-0 flex-wrap items-center gap-2 border-b border-white/[0.08] bg-[#232326] px-3 py-2">
          <button
            type="button"
            aria-label={showLibrary ? 'Hide document library' : 'Show document library'}
            onClick={() => setShowLibrary((value) => !value)}
            className="rounded-md p-1.5 text-white/45 hover:bg-white/[0.08] hover:text-white/80"
          >
            {showLibrary ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          </button>
          <input
            value={activeDocument.title}
            onChange={(event) => renameActiveDocument(event.target.value)}
            className="min-w-32 flex-1 bg-transparent text-sm font-semibold text-white/88 outline-none placeholder:text-white/30"
            aria-label="Document title"
          />
          <div className="flex rounded-md border border-white/[0.08] bg-black/18 p-0.5">
            {(['edit', 'split', 'preview'] as const).map((item) => {
              const Icon = item === 'edit' ? Pilcrow : item === 'split' ? SplitSquareHorizontal : Eye
              return (
                <button
                  key={item}
                  type="button"
                  aria-label={`${item} mode`}
                  onClick={() => setMode(item)}
                  className={cn('rounded px-2 py-1 text-white/42 transition-colors', mode === item && 'bg-white/12 text-white')}
                >
                  <Icon className="h-3.5 w-3.5" />
                </button>
              )
            })}
          </div>
          <button
            type="button"
            aria-label="Bold"
            onClick={() => wrapSelection('**')}
            className="rounded-md p-1.5 text-white/45 hover:bg-white/[0.08] hover:text-white/80"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Italic"
            onClick={() => wrapSelection('*')}
            className="rounded-md p-1.5 text-white/45 hover:bg-white/[0.08] hover:text-white/80"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            aria-label="Delete document"
            disabled={documents.length <= 1}
            onClick={deleteActiveDocument}
            className="rounded-md p-1.5 text-white/35 hover:bg-red-500/12 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-35"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </header>

        <div className="flex min-h-0 flex-1">
          {mode !== 'preview' ? (
            <section className={cn('relative min-w-0 flex-1 border-r border-white/[0.08]', mode === 'edit' && 'border-r-0')}>
              <div className="absolute left-4 top-4 z-10 flex items-center gap-1 rounded-md border border-white/[0.08] bg-[#2a2a2d]/95 px-2 py-1 text-[10px] uppercase tracking-widest text-white/32">
                <Sparkles className="h-3 w-3" />
                Slash commands
              </div>
              <textarea
                value={activeDocument.body}
                onChange={handleEditorChange}
                onSelect={(event) =>
                  setSelection({
                    start: event.currentTarget.selectionStart,
                    end: event.currentTarget.selectionEnd,
                  })
                }
                onKeyDown={handleKeyDown}
                spellCheck={false}
                className="h-full w-full resize-none bg-[#1d1d1f] px-5 pb-5 pt-14 font-mono text-[13px] leading-6 text-white/78 outline-none placeholder:text-white/26"
              />
              {matchingCommands.length > 0 ? (
                <div className="absolute left-5 top-14 w-56 overflow-hidden rounded-lg border border-white/[0.09] bg-[#2d2d31] shadow-2xl">
                  {matchingCommands.map((command) => {
                    const Icon = command.icon
                    return (
                      <button
                        key={command.id}
                        type="button"
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => applyCommand(command)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-white/72 hover:bg-white/[0.08] hover:text-white"
                      >
                        <Icon className="h-3.5 w-3.5" />
                        {command.label}
                      </button>
                    )
                  })}
                </div>
              ) : null}
            </section>
          ) : null}

          {mode !== 'edit' ? (
            <section className="min-w-0 flex-1 overflow-y-auto bg-[#f2eee6] text-[#24211c]">
              <article className="mx-auto max-w-3xl space-y-4 px-7 py-7 text-[14px] leading-7 [&_blockquote]:border-l-2 [&_blockquote]:border-[#8b6f3d] [&_blockquote]:pl-4 [&_code]:rounded [&_code]:bg-black/10 [&_code]:px-1 [&_h1]:text-2xl [&_h1]:font-bold [&_h2]:text-lg [&_h2]:font-bold [&_li]:ml-5 [&_ol]:list-decimal [&_p]:leading-7 [&_pre]:overflow-auto [&_pre]:rounded-lg [&_pre]:bg-black/10 [&_pre]:p-3 [&_ul]:list-disc">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeDocument.body}
                </ReactMarkdown>
              </article>
            </section>
          ) : null}
        </div>

        <footer className="flex shrink-0 items-center gap-3 border-t border-white/[0.08] bg-[#232326] px-3 py-1.5 text-[10px] text-white/35">
          <span className="flex items-center gap-1.5">
            <Save className="h-3 w-3" />
            Autosaved
          </span>
          <span>{stats.words} words</span>
          <span>{stats.chars} chars</span>
          <span className="ml-auto">{stats.lines} lines</span>
        </footer>
      </main>
    </div>
  )
}
