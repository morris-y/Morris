'use client'

import { useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, ChevronLeft, ExternalLink } from 'lucide-react'
import type { NoteFolder, NoteItem } from '@/lib/notes'

type MobileView = 'folders' | 'noteList' | 'noteContent'

export function NotesLayout({ folders, isWindowed = false }: { folders: NoteFolder[]; isWindowed?: boolean }) {
  const [activeFolder, setActiveFolder] = useState<NoteFolder | null>(folders[0] ?? null)
  const [activeNote, setActiveNote] = useState<NoteItem | null>(folders[0]?.notes[0] ?? null)
  const [mobileView, setMobileView] = useState<MobileView>('folders')

  function selectFolder(folder: NoteFolder) {
    setActiveFolder(folder)
    setActiveNote(folder.notes[0] ?? null)
    setMobileView('noteList')
  }

  function selectNote(note: NoteItem) {
    setActiveNote(note)
    setMobileView('noteContent')
  }

  return (
    <div className={`flex ${isWindowed ? 'h-full' : 'h-screen'} bg-[#1e1e1e] overflow-hidden`}>
      {/* Folder list — always visible on desktop, conditionally on mobile */}
      <aside
        className={[
          'w-48 shrink-0 bg-[#2c2c2e] border-r border-black/30 flex flex-col overflow-y-auto',
          'hidden md:flex',
          mobileView === 'folders' ? '!flex' : '',
        ].join(' ')}
      >
        <div className="px-4 pt-12 pb-3">
          {!isWindowed && (
            <Link href="/" className="flex items-center gap-1.5 text-white/40 hover:text-white/70 transition-colors text-xs mb-6">
              <ArrowLeft className="h-3 w-3" />
              home
            </Link>
          )}
          <p className="text-white/30 text-[10px] uppercase tracking-widest">Notes</p>
        </div>
        <nav className="flex-1 px-2">
          {folders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => selectFolder(folder)}
              className={[
                'w-full text-left px-3 py-2 rounded-lg text-sm transition-colors mb-0.5 flex items-center gap-2',
                activeFolder?.id === folder.id
                  ? 'bg-[#d4a036]/20 text-[#d4a036]'
                  : 'text-white/60 hover:bg-white/5 hover:text-white/80',
              ].join(' ')}
            >
              <span className="text-base">
                {folder.id === 'medium' ? '📰' : folder.id === 'thoughts' ? '💭' : folder.id === 'pm' ? '📦' : '📁'}
              </span>
              <span className="truncate">{folder.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Note list */}
      <div
        className={[
          'w-64 shrink-0 border-r border-black/30 flex flex-col overflow-y-auto bg-[#2c2c2e]',
          'hidden md:flex',
          mobileView === 'noteList' ? '!flex w-full md:w-64' : '',
        ].join(' ')}
      >
        {/* Mobile back button */}
        <div className="md:hidden px-4 pt-10 pb-2">
          <button
            onClick={() => setMobileView('folders')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            folders
          </button>
        </div>
        <div className="px-4 pt-10 pb-3 hidden md:block">
          <p className="text-white/30 text-[10px] uppercase tracking-widest">
            {activeFolder?.label ?? 'notes'}
          </p>
        </div>
        <div className="flex-1 px-2">
          {(activeFolder?.notes ?? []).map((note) => (
            <button
              key={note.slug}
              onClick={() => selectNote(note)}
              className={[
                'w-full text-left px-3 py-3 rounded-lg transition-colors mb-0.5',
                activeNote?.slug === note.slug
                  ? 'bg-[#d4a036]/15'
                  : 'hover:bg-white/5',
              ].join(' ')}
            >
              <p
                className={[
                  'text-sm font-display font-medium leading-tight line-clamp-1 tracking-display',
                  activeNote?.slug === note.slug ? 'text-[#d4a036]' : 'text-white/80',
                ].join(' ')}
              >
                {note.title}
              </p>
              {note.date && (
                <p className="text-white/30 text-[10px] mt-0.5">{note.date}</p>
              )}
              <p className="text-white/40 text-xs mt-1 line-clamp-2 leading-relaxed">
                {note.content.replace(/<[^>]*>/g, '').replace(/^#+\s.*$/m, '').replace(/#/g, '').substring(0, 80).trim()}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Note content */}
      <div
        className={[
          'flex-1 overflow-y-auto bg-[#1e1e1e]',
          mobileView === 'noteContent' ? 'flex flex-col' : 'hidden md:block',
        ].join(' ')}
      >
        {/* Mobile back button */}
        <div className="md:hidden px-6 pt-10 pb-2">
          <button
            onClick={() => setMobileView('noteList')}
            className="flex items-center gap-1 text-white/40 hover:text-white/70 text-xs"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            {activeFolder?.label ?? 'notes'}
          </button>
        </div>

        {activeNote ? (
          <div className="max-w-2xl mx-auto px-6 md:px-12 py-10 md:pt-14">
            <div className="flex items-start justify-between gap-4 mb-8">
              <div>
                {activeNote.date && (
                  <p className="text-white/30 text-xs mb-1">{activeNote.date}</p>
                )}
              </div>
              {activeNote.url && (
                <a
                  href={activeNote.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-white/30 hover:text-[#d4a036] transition-colors text-xs shrink-0"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  read on medium
                </a>
              )}
            </div>
            <div className="notes-content">
              {activeNote.source === 'medium' ? (
                <div dangerouslySetInnerHTML={{ __html: activeNote.content }} />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeNote.content}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-white/20 text-sm">
            select a note
          </div>
        )}
      </div>
    </div>
  )
}
