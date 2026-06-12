'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import type { MouseEvent } from 'react'
import { Bomb, Flag, RotateCcw, Timer, Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

type GameStatus = 'ready' | 'playing' | 'won' | 'lost'
type DifficultyId = 'beginner' | 'intermediate' | 'expert'

interface Difficulty {
  id: DifficultyId
  label: string
  rows: number
  cols: number
  mines: number
}

interface Cell {
  row: number
  col: number
  mine: boolean
  adjacent: number
  revealed: boolean
  flagged: boolean
}

const DIFFICULTIES: Difficulty[] = [
  { id: 'beginner', label: 'Beginner', rows: 9, cols: 9, mines: 10 },
  { id: 'intermediate', label: 'Intermediate', rows: 16, cols: 16, mines: 40 },
  { id: 'expert', label: 'Expert', rows: 16, cols: 30, mines: 99 },
]

const NUMBER_COLORS = [
  '',
  'text-[#1f6feb]',
  'text-[#238636]',
  'text-[#da3633]',
  'text-[#8957e5]',
  'text-[#a37100]',
  'text-[#0f766e]',
  'text-[#24292f]',
  'text-[#57606a]',
]

function makeEmptyBoard(difficulty: Difficulty): Cell[][] {
  return Array.from({ length: difficulty.rows }, (_, row) =>
    Array.from({ length: difficulty.cols }, (_, col) => ({
      row,
      col,
      mine: false,
      adjacent: 0,
      revealed: false,
      flagged: false,
    }))
  )
}

function neighbors(row: number, col: number, rows: number, cols: number) {
  const result: [number, number][] = []
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue
      const nextRow = row + dr
      const nextCol = col + dc
      if (nextRow >= 0 && nextRow < rows && nextCol >= 0 && nextCol < cols) {
        result.push([nextRow, nextCol])
      }
    }
  }
  return result
}

function plantMines(board: Cell[][], difficulty: Difficulty, safeRow: number, safeCol: number) {
  const blocked = new Set<string>([
    `${safeRow}:${safeCol}`,
    ...neighbors(safeRow, safeCol, difficulty.rows, difficulty.cols).map(([row, col]) => `${row}:${col}`),
  ])
  const candidates: [number, number][] = []
  for (let row = 0; row < difficulty.rows; row++) {
    for (let col = 0; col < difficulty.cols; col++) {
      if (!blocked.has(`${row}:${col}`)) candidates.push([row, col])
    }
  }

  for (let i = candidates.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[candidates[i], candidates[j]] = [candidates[j], candidates[i]]
  }

  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  candidates.slice(0, difficulty.mines).forEach(([row, col]) => {
    next[row][col].mine = true
  })

  for (let row = 0; row < difficulty.rows; row++) {
    for (let col = 0; col < difficulty.cols; col++) {
      if (next[row][col].mine) continue
      next[row][col].adjacent = neighbors(row, col, difficulty.rows, difficulty.cols).filter(
        ([nextRow, nextCol]) => next[nextRow][nextCol].mine
      ).length
    }
  }

  return next
}

function revealCells(board: Cell[][], startRow: number, startCol: number) {
  const next = board.map((row) => row.map((cell) => ({ ...cell })))
  const queue: [number, number][] = [[startRow, startCol]]

  while (queue.length > 0) {
    const [row, col] = queue.shift()!
    const cell = next[row][col]
    if (cell.revealed || cell.flagged) continue

    cell.revealed = true
    if (cell.adjacent !== 0 || cell.mine) continue

    neighbors(row, col, next.length, next[0].length).forEach(([nextRow, nextCol]) => {
      const neighbor = next[nextRow][nextCol]
      if (!neighbor.revealed && !neighbor.flagged) queue.push([nextRow, nextCol])
    })
  }

  return next
}

function revealAllMines(board: Cell[][]) {
  return board.map((row) =>
    row.map((cell) => ({
      ...cell,
      revealed: cell.revealed || cell.mine,
    }))
  )
}

function hasWon(board: Cell[][], difficulty: Difficulty) {
  const revealed = board.flat().filter((cell) => cell.revealed).length
  return revealed === difficulty.rows * difficulty.cols - difficulty.mines
}

function getDifficulty(id: DifficultyId) {
  return DIFFICULTIES.find((difficulty) => difficulty.id === id) ?? DIFFICULTIES[0]
}

export function MinesweeperApp() {
  const [difficultyId, setDifficultyId] = useState<DifficultyId>('beginner')
  const difficulty = useMemo(() => getDifficulty(difficultyId), [difficultyId])
  const [board, setBoard] = useState<Cell[][]>(() => makeEmptyBoard(difficulty))
  const [status, setStatus] = useState<GameStatus>('ready')
  const [elapsed, setElapsed] = useState(0)
  const [startedAt, setStartedAt] = useState<number | null>(null)

  const flagsUsed = board.flat().filter((cell) => cell.flagged).length
  const minesLeft = difficulty.mines - flagsUsed

  const reset = useCallback((nextDifficulty = difficulty) => {
    setBoard(makeEmptyBoard(nextDifficulty))
    setStatus('ready')
    setElapsed(0)
    setStartedAt(null)
  }, [difficulty])

  useEffect(() => {
    const nextDifficulty = getDifficulty(difficultyId)
    reset(nextDifficulty)
  }, [difficultyId, reset])

  useEffect(() => {
    if (status !== 'playing' || startedAt === null) return
    const interval = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000))
    }, 250)
    return () => window.clearInterval(interval)
  }, [startedAt, status])

  function reveal(row: number, col: number) {
    if (status === 'lost' || status === 'won') return
    const target = board[row][col]
    if (target.flagged || target.revealed) return

    let workingBoard = board
    if (status === 'ready') {
      workingBoard = plantMines(board, difficulty, row, col)
      setStatus('playing')
      setStartedAt(Date.now())
    }

    if (workingBoard[row][col].mine) {
      setBoard(revealAllMines(workingBoard))
      setStatus('lost')
      return
    }

    const revealed = revealCells(workingBoard, row, col)
    if (hasWon(revealed, difficulty)) {
      setBoard(
        revealed.map((line) =>
          line.map((cell) => (cell.mine ? { ...cell, flagged: true } : cell))
        )
      )
      setStatus('won')
      return
    }

    setBoard(revealed)
  }

  function toggleFlag(event: MouseEvent<HTMLButtonElement>, row: number, col: number) {
    event.preventDefault()
    if (status === 'lost' || status === 'won') return
    const cell = board[row][col]
    if (cell.revealed) return
    setBoard((current) =>
      current.map((line, rowIndex) =>
        line.map((item, colIndex) =>
          rowIndex === row && colIndex === col ? { ...item, flagged: !item.flagged } : item
        )
      )
    )
  }

  const statusText =
    status === 'won'
      ? 'Cleared'
      : status === 'lost'
        ? 'Mine hit'
        : status === 'playing'
          ? 'In progress'
          : 'Ready'

  return (
    <div className="flex h-full w-full flex-col overflow-hidden bg-[#bfc7d5] text-[#111827]">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-[#7f8ba0] bg-[#dce3ee] p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded border border-[#8b96aa] bg-[#f8fafc] shadow-sm">
            {status === 'won' ? <Trophy size={19} className="text-[#a37100]" /> : <Bomb size={19} />}
          </div>
          <div>
            <h2 className="font-display text-base font-semibold leading-tight">Minesweeper</h2>
            <p className="text-xs text-slate-600">{statusText}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={difficultyId}
            onChange={(event) => setDifficultyId(event.target.value as DifficultyId)}
            className="h-8 rounded border border-[#8b96aa] bg-white px-2 text-xs outline-none"
          >
            {DIFFICULTIES.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => reset()}
            className="flex h-8 items-center gap-1.5 rounded border border-[#8b96aa] bg-white px-3 text-xs font-semibold hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Restart
          </button>
        </div>
      </div>

      <div className="flex shrink-0 items-center justify-center gap-3 border-b border-[#8b96aa] bg-[#cbd5e1] px-3 py-2 font-mono text-sm">
        <div className="flex h-8 min-w-24 items-center justify-center gap-1 rounded bg-[#111827] px-3 text-red-400">
          <Flag size={14} />
          {String(Math.max(0, minesLeft)).padStart(3, '0')}
        </div>
        <div className="rounded border border-[#7f8ba0] bg-[#e5e7eb] px-3 py-1 text-xs font-semibold text-slate-700">
          {difficulty.cols} x {difficulty.rows}
        </div>
        <div className="flex h-8 min-w-24 items-center justify-center gap-1 rounded bg-[#111827] px-3 text-red-400">
          <Timer size={14} />
          {String(Math.min(elapsed, 999)).padStart(3, '0')}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto bg-[#aeb8c8] p-4">
        <div
          className="mx-auto grid w-max border border-[#7b8495] bg-[#7b8495] shadow-inner"
          style={{
            gridTemplateColumns: `repeat(${difficulty.cols}, minmax(24px, 28px))`,
          }}
        >
          {board.flat().map((cell) => (
            <button
              key={`${cell.row}-${cell.col}`}
              onClick={() => reveal(cell.row, cell.col)}
              onContextMenu={(event) => toggleFlag(event, cell.row, cell.col)}
              className={cn(
                'grid aspect-square h-7 w-7 place-items-center border text-sm font-black leading-none',
                cell.revealed
                  ? 'border-[#9ca3af] bg-[#d1d5db]'
                  : 'border-b-[#6b7280] border-l-[#f8fafc] border-r-[#6b7280] border-t-[#f8fafc] bg-[#cbd5e1] hover:bg-[#dbe3ee]',
                cell.mine && cell.revealed && 'bg-[#ef4444] text-black'
              )}
              aria-label={`row ${cell.row + 1} column ${cell.col + 1}`}
            >
              {cell.flagged && !cell.revealed ? (
                <Flag size={14} className="fill-red-500 text-red-600" />
              ) : cell.revealed && cell.mine ? (
                <Bomb size={15} />
              ) : cell.revealed && cell.adjacent > 0 ? (
                <span className={NUMBER_COLORS[cell.adjacent]}>{cell.adjacent}</span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      <div className="shrink-0 border-t border-[#7f8ba0] bg-[#dce3ee] px-3 py-1.5 text-xs text-slate-600">
        Left click reveals. Right click places a flag. First reveal is always safe.
      </div>
    </div>
  )
}
