'use client'

import { useMemo, useRef, useState } from 'react'
import { Bot, Lock, Mic, Plus, Send, Sparkles, Users, Wrench } from 'lucide-react'
import type { AppWindowProps } from '@/types/window'

type RoomKind = 'public' | 'private' | 'ryo'
type Message = {
  id: number
  roomId: string
  author: 'you' | 'ryo' | 'system' | 'sam' | 'kai'
  body: string
  at: string
  voice?: boolean
  tool?: string
}

const rooms: { id: string; name: string; kind: RoomKind; description: string }[] = [
  { id: 'ryo', name: 'Ryo', kind: 'ryo', description: 'AI co-pilot with local tools' },
  { id: 'lobby', name: 'Public Lobby', kind: 'public', description: 'Open room for quick drops' },
  { id: 'studio', name: 'Private Studio', kind: 'private', description: 'Encrypted draft room' },
]

const seedMessages: Message[] = [
  { id: 1, roomId: 'ryo', author: 'ryo', body: 'I can inspect this desktop, draft plans, or run tiny tools. Try: /tool summarize apps', at: '09:41' },
  { id: 2, roomId: 'lobby', author: 'sam', body: 'Anyone tried the new MacPaint patterns yet?', at: '09:43' },
  { id: 3, roomId: 'studio', author: 'kai', body: 'Private build notes live here. Voice clips stay local.', at: '09:44', voice: true },
]

function nowLabel() {
  return new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' }).format(new Date())
}

function ryoReply(prompt: string): Message {
  const lower = prompt.toLowerCase()
  if (lower.startsWith('/tool')) {
    return {
      id: Date.now() + 1,
      roomId: 'ryo',
      author: 'ryo',
      body: 'Tool call completed locally: scanned open app intents, grouped risky permissions, and prepared a compact checklist.',
      at: nowLabel(),
      tool: prompt.replace('/tool', '').trim() || 'desktop.scan',
    }
  }
  if (lower.includes('voice')) {
    return { id: Date.now() + 1, roomId: 'ryo', author: 'ryo', body: 'Voice note queued as a transcript. Browser microphone permission is optional; I can work from typed notes too.', at: nowLabel(), voice: true }
  }
  return {
    id: Date.now() + 1,
    roomId: 'ryo',
    author: 'ryo',
    body: `I would approach "${prompt}" by making the smallest visible slice first, then wiring persistence and permissions once the interface feels right.`,
    at: nowLabel(),
  }
}

export function ChatsApp(_: AppWindowProps) {
  const [activeRoom, setActiveRoom] = useState('ryo')
  const [messages, setMessages] = useState<Message[]>(seedMessages)
  const [draft, setDraft] = useState('')
  const [recording, setRecording] = useState(false)
  const nextId = useRef(10)
  const room = rooms.find((item) => item.id === activeRoom) ?? rooms[0]
  const visibleMessages = messages.filter((message) => message.roomId === activeRoom)
  const roomStats = useMemo(() => {
    const tools = visibleMessages.filter((message) => message.tool).length
    const voices = visibleMessages.filter((message) => message.voice).length
    return { tools, voices, count: visibleMessages.length }
  }, [visibleMessages])

  function send(voice = false) {
    const body = draft.trim() || (voice ? 'Voice memo: quick thought captured from the room.' : '')
    if (!body) return
    const userMessage: Message = {
      id: nextId.current++,
      roomId: activeRoom,
      author: 'you',
      body,
      at: nowLabel(),
      voice,
    }
    setMessages((prev) => {
      const next = [...prev, userMessage]
      if (activeRoom === 'ryo') next.push({ ...ryoReply(body), roomId: activeRoom })
      return next
    })
    setDraft('')
    setRecording(false)
  }

  return (
    <div className="flex h-full bg-[#090a0a] text-white">
      <aside className="w-56 shrink-0 border-r border-white/10 bg-black/35 p-3">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-mono text-[10px] uppercase text-[#d7ff2f]">Chats</p>
            <h2 className="font-display text-2xl leading-none">Signal Rooms</h2>
          </div>
          <button className="rounded-md border border-white/10 p-1.5 text-white/70 hover:bg-white/10" aria-label="New room">
            <Plus size={15} />
          </button>
        </div>
        <div className="space-y-2">
          {rooms.map((item) => {
            const selected = item.id === activeRoom
            const Icon = item.kind === 'private' ? Lock : item.kind === 'ryo' ? Bot : Users
            return (
              <button
                key={item.id}
                onClick={() => setActiveRoom(item.id)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${selected ? 'border-[#d7ff2f]/50 bg-[#d7ff2f]/12' : 'border-white/8 bg-white/[0.03] hover:bg-white/[0.07]'}`}
              >
                <span className="flex items-center gap-2 text-sm font-medium"><Icon size={15} />{item.name}</span>
                <span className="mt-1 block truncate text-xs text-white/42">{item.description}</span>
              </button>
            )
          })}
        </div>
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.04] p-3 font-mono text-[11px] text-white/50">
          <p>{roomStats.count} messages</p>
          <p>{roomStats.voices} voice notes</p>
          <p>{roomStats.tools} tool calls</p>
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <h3 className="font-display text-2xl leading-none">{room.name}</h3>
            <p className="mt-1 text-xs text-white/45">{room.description}</p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-[#d7ff2f]/25 bg-[#d7ff2f]/10 px-3 py-1 font-mono text-[10px] uppercase text-[#d7ff2f]">
            <Sparkles size={13} /> local ai
          </div>
        </header>

        <div className="flex-1 space-y-3 overflow-y-auto p-4">
          {visibleMessages.map((message) => {
            const mine = message.author === 'you'
            return (
              <div key={message.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[78%] rounded-xl border px-3 py-2 ${mine ? 'border-[#d7ff2f]/35 bg-[#d7ff2f]/12' : 'border-white/10 bg-white/[0.055]'}`}>
                  <div className="mb-1 flex items-center gap-2 font-mono text-[10px] uppercase text-white/40">
                    <span>{message.author}</span><span>{message.at}</span>
                    {message.voice ? <Mic size={12} className="text-[#d7ff2f]" /> : null}
                    {message.tool ? <Wrench size={12} className="text-cyan-300" /> : null}
                  </div>
                  {message.tool ? <p className="mb-1 rounded bg-black/30 px-2 py-1 font-mono text-[11px] text-cyan-200">tool: {message.tool}</p> : null}
                  <p className="text-sm leading-5 text-white/82">{message.body}</p>
                  {message.voice ? <div className="mt-2 h-8 rounded bg-[repeating-linear-gradient(90deg,rgba(215,255,47,.75)_0_2px,transparent_2px_7px)] opacity-70" /> : null}
                </div>
              </div>
            )
          })}
        </div>

        <footer className="border-t border-white/10 bg-black/35 p-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setRecording((value) => !value)}
              className={`rounded-lg border p-2 ${recording ? 'border-red-300/60 bg-red-500/20 text-red-100' : 'border-white/10 bg-white/[0.04] text-white/65 hover:bg-white/10'}`}
              aria-label="Record voice"
            >
              <Mic size={17} />
            </button>
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') send(recording)
              }}
              placeholder={activeRoom === 'ryo' ? 'Ask Ryo, or use /tool summarize apps' : 'Message this room'}
              className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-sm outline-none placeholder:text-white/28 focus:border-[#d7ff2f]/45"
            />
            <button onClick={() => send(recording)} className="rounded-lg bg-[#d7ff2f] p-2 text-black hover:bg-white" aria-label="Send">
              <Send size={17} />
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}
