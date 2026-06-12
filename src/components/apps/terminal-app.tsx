'use client'

import { useEffect, useRef, useState, useCallback, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { siteConfig, projects, skills } from '@/lib/content'
import type { AppWindowProps } from '@/types/window'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LineKind = 'output' | 'prompt' | 'command' | 'banner' | 'blank' | 'matrix'

interface TerminalLine {
  id: number
  kind: LineKind
  text: string
  color?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GREEN = 'text-[#00ff88]'
const DIM = 'text-[#8b949e]'
const ACCENT = 'text-[#58a6ff]'
const WARN = 'text-[#f0883e]'
const MUTED = 'text-[#484f58]'
const DEFAULT_TEXT = 'text-[#c9d1d9]'

const HELP_TEXT = [
  { text: 'Available commands:', color: GREEN },
  { text: '  help        — show this message', color: DEFAULT_TEXT },
  { text: '  about       — print bio', color: DEFAULT_TEXT },
  { text: '  projects    — list projects with outcomes', color: DEFAULT_TEXT },
  { text: '  contact     — show social links', color: DEFAULT_TEXT },
  { text: '  skills      — show tech skills', color: DEFAULT_TEXT },
  { text: '  ryo <ask>   — ask the local AI co-pilot', color: DEFAULT_TEXT },
  { text: '  clear       — clear terminal', color: DEFAULT_TEXT },
  { text: '  matrix      — ???', color: MUTED },
]

const ABOUT_LINES = [
  { text: '── bio.txt ──────────────────────────────────', color: DIM },
  ...siteConfig.bio.split('\n').map((line) => ({ text: line, color: DEFAULT_TEXT })),
  { text: '─────────────────────────────────────────────', color: DIM },
]

const PROJECTS_LINES = [
  { text: '── projects/ ────────────────────────────────', color: DIM },
  ...projects.flatMap((p) => [
    { text: `  ${p.title}`, color: ACCENT },
    { text: `    ${p.description}`, color: DEFAULT_TEXT },
    { text: `    outcomes: ${p.outcomes}`, color: GREEN },
    { text: `    stack:    ${p.techStack.join(', ')}`, color: DIM },
    { text: '', color: DEFAULT_TEXT },
  ]),
  { text: '─────────────────────────────────────────────', color: DIM },
]

const CONTACT_LINES = [
  { text: '── contact ──────────────────────────────────', color: DIM },
  { text: `  email     ${siteConfig.email}`, color: DEFAULT_TEXT },
  { text: `  x/twitter ${siteConfig.socials.x ?? '—'}`, color: DEFAULT_TEXT },
  { text: `  linkedin  ${siteConfig.socials.linkedin ?? '—'}`, color: DEFAULT_TEXT },
  { text: `  medium    ${siteConfig.socials.medium ?? '—'}`, color: DEFAULT_TEXT },
  { text: `  github    ${siteConfig.socials.github ?? '—'}`, color: DEFAULT_TEXT },
  { text: '─────────────────────────────────────────────', color: DIM },
]

const SKILLS_LINES = (() => {
  const byCategory = {
    domain: skills.filter((s) => s.category === 'domain').map((s) => s.label),
    tech: skills.filter((s) => s.category === 'tech').map((s) => s.label),
    tools: skills.filter((s) => s.category === 'tools').map((s) => s.label),
  }
  return [
    { text: '── skills ───────────────────────────────────', color: DIM },
    { text: '  Domain   ' + byCategory.domain.join('  ·  '), color: DEFAULT_TEXT },
    { text: '  Tech     ' + byCategory.tech.join('  ·  '), color: ACCENT },
    { text: '  Tools    ' + byCategory.tools.join('  ·  '), color: DIM },
    { text: '─────────────────────────────────────────────', color: DIM },
  ]
})()

// ---------------------------------------------------------------------------
// Matrix animation
// ---------------------------------------------------------------------------

const MATRIX_CHARS = '01アイウエオカキクケコサシスセソタチツテトナニヌネノ'

function buildMatrixFrame(cols: number, rows: number): string {
  const lines: string[] = []
  for (let r = 0; r < rows; r++) {
    let line = ''
    for (let c = 0; c < cols; c++) {
      line += MATRIX_CHARS[Math.floor(Math.random() * MATRIX_CHARS.length)]
    }
    lines.push(line)
  }
  return lines.join('\n')
}

function buildRyoResponse(prompt: string): string[] {
  const trimmed = prompt.trim()
  if (!trimmed) {
    return [
      'ryo: give me a prompt after the command.',
      'try: ryo summarize the built-in apps',
    ]
  }
  const lower = trimmed.toLowerCase()
  if (lower.includes('app') || lower.includes('built')) {
    return [
      'ryo: built-in app status looks like a constellation, not a list.',
      '  - Start with the app that proves the OS metaphor: Finder.',
      '  - Keep media apps playful but permission-safe.',
      '  - Anything AI-facing should degrade to a local simulation without keys.',
    ]
  }
  if (lower.includes('ship') || lower.includes('plan')) {
    return [
      'ryo: ship order:',
      '  1. make the first interaction real',
      '  2. persist the smallest useful state',
      '  3. verify the shell still opens every app',
    ]
  }
  return [
    `ryo: ${trimmed}`,
    'I would turn that into a tiny runnable artifact first, then let taste catch up with ambition.',
  ]
}

// ---------------------------------------------------------------------------
// Boot sequence definition
// ---------------------------------------------------------------------------

interface BootStep {
  delay: number // ms after previous step
  line: Omit<TerminalLine, 'id'>
  typewriter?: { text: string; speed: number } // if present, type character by character
}

function buildBootSequence(bio: string): BootStep[] {
  const steps: BootStep[] = [
    {
      delay: 200,
      line: { kind: 'banner', text: "Morris Yang's Portfolio — v2.0.0", color: GREEN },
    },
    {
      delay: 80,
      line: { kind: 'output', text: 'Running on macOS 15.0 (Sequoia)', color: DIM },
    },
    {
      delay: 80,
      line: { kind: 'banner', text: '─────────────────────────────────', color: MUTED },
    },
    { delay: 400, line: { kind: 'blank', text: '' } },
    { delay: 200, line: { kind: 'prompt', text: 'whoami', color: GREEN } },
    {
      delay: 80,
      line: { kind: 'output', text: 'Morris Yang — Product Builder', color: DEFAULT_TEXT },
      typewriter: { text: 'Morris Yang — Product Builder', speed: 28 },
    },
    { delay: 300, line: { kind: 'blank', text: '' } },
    { delay: 100, line: { kind: 'prompt', text: 'cat bio.txt', color: GREEN } },
    {
      delay: 80,
      line: { kind: 'output', text: bio, color: DEFAULT_TEXT },
      typewriter: { text: bio, speed: 12 },
    },
    { delay: 400, line: { kind: 'blank', text: '' } },
    { delay: 100, line: { kind: 'prompt', text: 'ls projects/', color: GREEN } },
    {
      delay: 80,
      line: {
        kind: 'output',
        text: 'prediction-markets-terminal  hubble-ai-platform',
        color: ACCENT,
      },
    },
    { delay: 400, line: { kind: 'blank', text: '' } },
    { delay: 100, line: { kind: 'prompt', text: './welcome.sh', color: GREEN } },
    {
      delay: 80,
      line: {
        kind: 'output',
        text: "Welcome. Type 'help' for available commands.",
        color: GREEN,
      },
    },
    { delay: 80, line: { kind: 'blank', text: '' } },
  ]
  return steps
}

// ---------------------------------------------------------------------------
// Hook: typewriter effect
// ---------------------------------------------------------------------------

function useTypewriter(
  onChar: (char: string, done: boolean) => void,
  speed: number,
) {
  const refQueue = useRef<string>('')
  const refTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const refOnChar = useRef(onChar)
  refOnChar.current = onChar

  const start = useCallback(
    (text: string) => {
      refQueue.current = text
      if (refTimer.current) clearTimeout(refTimer.current)

      const tick = () => {
        if (refQueue.current.length === 0) {
          refOnChar.current('', true)
          return
        }
        const ch = refQueue.current[0]
        refQueue.current = refQueue.current.slice(1)
        refOnChar.current(ch, refQueue.current.length === 0)
        refTimer.current = setTimeout(tick, speed)
      }
      refTimer.current = setTimeout(tick, speed)
    },
    [speed],
  )

  const stop = useCallback(() => {
    if (refTimer.current) clearTimeout(refTimer.current)
    refQueue.current = ''
  }, [])

  return { start, stop }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

let lineIdCounter = 1
function nextId() {
  return lineIdCounter++
}

export function TerminalApp({ isFocused }: AppWindowProps) {
  const [lines, setLines] = useState<TerminalLine[]>([])
  const [inputValue, setInputValue] = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [historyIdx, setHistoryIdx] = useState(-1)
  const [isBooting, setIsBooting] = useState(true)
  const [showCursor, setShowCursor] = useState(true)

  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const matrixRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const bootDoneRef = useRef(false)

  // -- blinking cursor
  useEffect(() => {
    const id = setInterval(() => setShowCursor((v) => !v), 530)
    return () => clearInterval(id)
  }, [])

  // -- scroll to bottom whenever lines change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [lines])

  // -- focus input when window is focused
  useEffect(() => {
    if (isFocused && !isBooting) {
      inputRef.current?.focus()
    }
  }, [isFocused, isBooting])

  // -- typewriter state for boot
  const [typingLineId, setTypingLineId] = useState<number | null>(null)

  const appendLine = useCallback((line: Omit<TerminalLine, 'id'>): number => {
    const id = nextId()
    setLines((prev) => [...prev, { ...line, id }])
    return id
  }, [])

  const updateLine = useCallback((id: number, text: string) => {
    setLines((prev) => prev.map((l) => (l.id === id ? { ...l, text } : l)))
  }, [])

  // -- boot sequence
  useEffect(() => {
    if (bootDoneRef.current) return
    bootDoneRef.current = true

    const steps = buildBootSequence(siteConfig.bio)

    // We process steps serially but need to account for typewriter time.
    // We'll chain them imperatively with a simple runner.
    let aborted = false

    const runSteps = async () => {
      for (const step of steps) {
        if (aborted) break
        await new Promise<void>((res) => setTimeout(res, step.delay))
        if (aborted) break

        if (step.line.kind === 'prompt') {
          // Show prompt line immediately (no typewriter for the command itself in boot)
          appendLine(step.line)
          continue
        }

        if (step.typewriter) {
          const { text, speed } = step.typewriter
          // Append empty line first, then type into it
          const id = appendLine({ ...step.line, text: '' })
          setTypingLineId(id)
          // Type characters one by one
          await new Promise<void>((res) => {
            let i = 0
            const tick = () => {
              if (aborted) { res(); return }
              if (i >= text.length) { setTypingLineId(null); res(); return }
              const partial = text.slice(0, i + 1)
              updateLine(id, partial)
              i++
              setTimeout(tick, speed)
            }
            setTimeout(tick, speed)
          })
        } else {
          appendLine(step.line)
        }
      }

      if (!aborted) {
        setIsBooting(false)
        setTimeout(() => inputRef.current?.focus(), 50)
      }
    }

    runSteps()

    return () => {
      aborted = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // -- command executor
  const executeCommand = useCallback(
    (raw: string) => {
      const cmd = raw.trim().toLowerCase()

      // Echo the prompt+command
      appendLine({ kind: 'prompt', text: raw, color: GREEN })

      if (!cmd) return

      setHistory((prev) => [raw, ...prev])
      setHistoryIdx(-1)

      if (cmd === 'clear') {
        setLines([])
        return
      }

      if (cmd === 'help') {
        HELP_TEXT.forEach((l) => appendLine({ kind: 'output', text: l.text, color: l.color }))
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd === 'about') {
        ABOUT_LINES.forEach((l) => appendLine({ kind: 'output', text: l.text, color: l.color }))
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd === 'projects') {
        PROJECTS_LINES.forEach((l) => appendLine({ kind: 'output', text: l.text, color: l.color }))
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd === 'contact') {
        CONTACT_LINES.forEach((l) => appendLine({ kind: 'output', text: l.text, color: l.color }))
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd === 'skills') {
        SKILLS_LINES.forEach((l) => appendLine({ kind: 'output', text: l.text, color: l.color }))
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd.startsWith('ryo')) {
        const prompt = raw.trim().slice(3)
        buildRyoResponse(prompt).forEach((text) => appendLine({ kind: 'output', text, color: ACCENT }))
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd === 'sudo rm -rf /' || cmd === 'sudo rm -rf' || cmd === 'rm -rf /') {
        appendLine({
          kind: 'output',
          text: 'nice try. 😏 (protected by apple silicon)',
          color: WARN,
        })
        appendLine({ kind: 'blank', text: '' })
        return
      }

      if (cmd === 'matrix') {
        appendLine({ kind: 'output', text: 'Entering the matrix...', color: GREEN })
        const COLS = 50
        const ROWS = 8
        const matrixId = appendLine({ kind: 'matrix', text: buildMatrixFrame(COLS, ROWS), color: GREEN })

        let elapsed = 0
        const INTERVAL = 80
        const DURATION = 3000

        if (matrixRef.current) clearInterval(matrixRef.current)
        matrixRef.current = setInterval(() => {
          elapsed += INTERVAL
          updateLine(matrixId, buildMatrixFrame(COLS, ROWS))
          if (elapsed >= DURATION) {
            clearInterval(matrixRef.current!)
            matrixRef.current = null
            appendLine({ kind: 'output', text: 'You are still in the matrix.', color: DIM })
            appendLine({ kind: 'blank', text: '' })
          }
        }, INTERVAL)
        return
      }

      // Unknown command
      appendLine({
        kind: 'output',
        text: `zsh: command not found: ${raw.trim()}`,
        color: WARN,
      })
      appendLine({ kind: 'blank', text: '' })
    },
    [appendLine, updateLine],
  )

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        executeCommand(inputValue)
        setInputValue('')
        setHistoryIdx(-1)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHistoryIdx((idx) => {
          const next = Math.min(idx + 1, history.length - 1)
          if (history[next] !== undefined) setInputValue(history[next])
          return next
        })
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHistoryIdx((idx) => {
          const next = Math.max(idx - 1, -1)
          if (next === -1) {
            setInputValue('')
          } else if (history[next] !== undefined) {
            setInputValue(history[next])
          }
          return next
        })
      } else if (e.key === 'l' && e.ctrlKey) {
        e.preventDefault()
        setLines([])
      }
    },
    [executeCommand, inputValue, history],
  )

  // cleanup matrix interval on unmount
  useEffect(() => {
    return () => {
      if (matrixRef.current) clearInterval(matrixRef.current)
    }
  }, [])

  return (
    <div
      className="flex flex-col w-full h-full bg-[#0d1117] font-mono text-sm select-text overflow-hidden"
      onClick={() => !isBooting && inputRef.current?.focus()}
    >
      {/* Scrollable output area */}
      <div className="flex-1 overflow-y-auto px-4 pt-3 pb-2 space-y-0.5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
        {lines.map((line) => {
          if (line.kind === 'blank') {
            return <div key={line.id} className="h-2" />
          }

          if (line.kind === 'prompt') {
            return (
              <div key={line.id} className="flex items-start gap-1.5 leading-5">
                <span className="text-[#00ff88] shrink-0 select-none">{'>'}</span>
                <span className="text-[#c9d1d9] break-all">{line.text}</span>
              </div>
            )
          }

          if (line.kind === 'matrix') {
            return (
              <pre
                key={line.id}
                className="text-[#00ff88] text-xs leading-tight whitespace-pre overflow-hidden"
                style={{ opacity: 0.85 }}
              >
                {line.text}
              </pre>
            )
          }

          if (line.kind === 'banner') {
            return (
              <div key={line.id} className={cn('leading-5 font-bold', line.color ?? DEFAULT_TEXT)}>
                {line.text}
              </div>
            )
          }

          // output
          return (
            <div
              key={line.id}
              className={cn('leading-5 break-all whitespace-pre-wrap', line.color ?? DEFAULT_TEXT)}
            >
              {line.text}
            </div>
          )
        })}

        {/* Bottom anchor for auto-scroll */}
        <div ref={bottomRef} />
      </div>

      {/* Input row */}
      {!isBooting && (
        <div className="flex items-center gap-1.5 px-4 py-2 border-t border-white/5 bg-[#0d1117] shrink-0">
          <span className="text-[#00ff88] shrink-0 select-none">{'>'}</span>
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="w-full bg-transparent text-[#c9d1d9] outline-none caret-transparent"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              aria-label="Terminal input"
            />
            {/* Custom blinking cursor — positioned after current text */}
            <span
              className="absolute top-0 bottom-0 flex items-center pointer-events-none"
              style={{ left: `${inputValue.length}ch` }}
              aria-hidden
            >
              <span
                className={cn(
                  'inline-block w-[7px] h-[14px] bg-[#00ff88]',
                  showCursor ? 'opacity-100' : 'opacity-0',
                )}
              />
            </span>
          </div>
        </div>
      )}

      {/* Booting cursor row */}
      {isBooting && (
        <div className="px-4 py-2 border-t border-white/5 bg-[#0d1117] shrink-0 h-9" />
      )}
    </div>
  )
}
