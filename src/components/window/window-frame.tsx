'use client'

import { useRef, useCallback, useEffect, useState, Suspense } from 'react'
import { motion } from 'motion/react'
import { useWindowStore } from '@/stores/use-window-store'
import { WindowTitlebar } from './window-titlebar'
import { cn } from '@/lib/utils'
import type { WindowPosition, WindowSize, AppId } from '@/types/window'

// ─── Resize direction helpers ─────────────────────────────────────────────────

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw'

interface ResizeHandle {
  dir: ResizeDirection
  className: string
  cursor: string
}

const RESIZE_HANDLES: ResizeHandle[] = [
  { dir: 'n',  className: 'absolute top-0 left-4 right-4 h-[5px]',        cursor: 'cursor-ns-resize'   },
  { dir: 's',  className: 'absolute bottom-0 left-4 right-4 h-[5px]',     cursor: 'cursor-ns-resize'   },
  { dir: 'e',  className: 'absolute top-4 bottom-4 right-0 w-[5px]',      cursor: 'cursor-ew-resize'   },
  { dir: 'w',  className: 'absolute top-4 bottom-4 left-0 w-[5px]',       cursor: 'cursor-ew-resize'   },
  { dir: 'ne', className: 'absolute top-0 right-0 w-4 h-4',               cursor: 'cursor-nesw-resize' },
  { dir: 'nw', className: 'absolute top-0 left-0 w-4 h-4',               cursor: 'cursor-nwse-resize' },
  { dir: 'se', className: 'absolute bottom-0 right-0 w-4 h-4',            cursor: 'cursor-nwse-resize' },
  { dir: 'sw', className: 'absolute bottom-0 left-0 w-4 h-4',            cursor: 'cursor-nesw-resize' },
]

const MENUBAR_H = 28
const DOCK_RESERVE = 80

function clamp(v: number, min: number, max: number): number {
  return Math.min(Math.max(v, min), max)
}

// ─── Props ────────────────────────────────────────────────────────────────────

export interface WindowFrameProps {
  instanceId: string
  appId: AppId
  title: string
  position: WindowPosition
  size: WindowSize
  isMinimized: boolean
  isFocused: boolean
  isFullscreen?: boolean
  zIndex: number
  minSize?: WindowSize
  children: React.ReactNode
  onClose: () => void
  onMinimize: () => void
  onMaximize: () => void
  onFullscreen?: () => void
  onFocus: () => void
}

// ─── Loading fallback (per-window Suspense) ─────────────────────────────────────

function WindowLoading() {
  return (
    <div className="w-full h-full bg-[#1c1c1e] flex items-center justify-center">
      <div className="w-5 h-5 rounded-full border-2 border-white/15 border-t-white/55 animate-spin" />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function WindowFrame({
  instanceId,
  title,
  position,
  size,
  isMinimized,
  isFocused,
  isFullscreen,
  zIndex,
  minSize = { width: 400, height: 300 },
  children,
  onClose,
  onMinimize,
  onMaximize,
  onFullscreen,
  onFocus,
}: WindowFrameProps) {
  const updatePosition = useWindowStore((s) => s.updatePosition)
  const updateSize = useWindowStore((s) => s.updateSize)

  // Fullscreen auto-hides the titlebar; hovering the top edge reveals it (macOS).
  const [chromeRevealed, setChromeRevealed] = useState(false)

  // Refs for drag / resize state (avoids re-renders during pointer move)
  const dragState = useRef<{
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    pointerId: number
  } | null>(null)

  const resizeState = useRef<{
    dir: ResizeDirection
    startX: number
    startY: number
    startPosX: number
    startPosY: number
    startW: number
    startH: number
    pointerId: number
  } | null>(null)

  // Live refs so pointermove handlers always read the latest store values
  const positionRef = useRef(position)
  positionRef.current = position
  const sizeRef = useRef(size)
  sizeRef.current = size

  // ── Drag ──────────────────────────────────────────────────────────────────
  // Stable refs for window listeners avoid stale-closure bugs.

  const handleDragMove = useCallback(
    (e: PointerEvent) => {
      const s = dragState.current
      if (!s || e.pointerId !== s.pointerId) return

      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      const w = sizeRef.current.width

      const vw = window.innerWidth
      const workH = window.innerHeight - MENUBAR_H - DOCK_RESERVE

      // Keep at least ~120px of titlebar reachable on every side, and never let
      // the titlebar slide under the menubar or below the dock.
      const newX = clamp(s.startPosX + dx, -(w - 120), vw - 120)
      const newY = clamp(s.startPosY + dy, 0, Math.max(0, workH - 38))

      updatePosition(instanceId, { x: newX, y: newY })
    },
    [instanceId, updatePosition]
  )

  const handleDragMoveRef = useRef(handleDragMove)
  useEffect(() => { handleDragMoveRef.current = handleDragMove }, [handleDragMove])

  const stableDragMove = useRef((e: PointerEvent) => handleDragMoveRef.current(e)).current
  const stableDragUp = useRef((e: PointerEvent) => {
    const s = dragState.current
    if (!s || e.pointerId !== s.pointerId) return
    try { (e.target as Element).releasePointerCapture?.(e.pointerId) } catch {}
    dragState.current = null
    window.removeEventListener('pointermove', stableDragMove)
    window.removeEventListener('pointerup', stableDragUp)
  }).current

  const handleDragStart = useCallback(
    (e: React.PointerEvent) => {
      e.currentTarget.setPointerCapture(e.pointerId)
      dragState.current = {
        startX: e.clientX,
        startY: e.clientY,
        startPosX: positionRef.current.x,
        startPosY: positionRef.current.y,
        pointerId: e.pointerId,
      }
      window.addEventListener('pointermove', stableDragMove)
      window.addEventListener('pointerup', stableDragUp)
    },
    [stableDragMove, stableDragUp]
  )

  // ── Resize ────────────────────────────────────────────────────────────────

  const handleResizeMove = useCallback(
    (e: PointerEvent) => {
      const s = resizeState.current
      if (!s || e.pointerId !== s.pointerId) return

      const dx = e.clientX - s.startX
      const dy = e.clientY - s.startY
      const dir = s.dir

      let newW = s.startW
      let newH = s.startH
      let newX = s.startPosX
      let newY = s.startPosY

      if (dir.includes('e')) newW = Math.max(minSize.width, s.startW + dx)
      if (dir.includes('w')) {
        newW = Math.max(minSize.width, s.startW - dx)
        newX = s.startPosX + (s.startW - newW)
      }
      if (dir.includes('s')) newH = Math.max(minSize.height, s.startH + dy)
      if (dir === 'n' || dir === 'ne' || dir === 'nw') {
        newH = Math.max(minSize.height, s.startH - dy)
        newY = s.startPosY + (s.startH - newH)
      }

      if (newY < 0) {
        newH = Math.max(minSize.height, newH + newY)
        newY = 0
      }

      updatePosition(instanceId, { x: newX, y: newY })
      updateSize(instanceId, { width: newW, height: newH })
    },
    [instanceId, minSize, updatePosition, updateSize]
  )

  const handleResizeMoveRef = useRef(handleResizeMove)
  useEffect(() => { handleResizeMoveRef.current = handleResizeMove }, [handleResizeMove])

  const stableResizeMove = useRef((e: PointerEvent) => handleResizeMoveRef.current(e)).current
  const stableResizeUp = useRef((e: PointerEvent) => {
    const s = resizeState.current
    if (!s || e.pointerId !== s.pointerId) return
    try { (e.target as Element).releasePointerCapture?.(e.pointerId) } catch {}
    resizeState.current = null
    window.removeEventListener('pointermove', stableResizeMove)
    window.removeEventListener('pointerup', stableResizeUp)
  }).current

  const handleResizeStart = useCallback(
    (e: React.PointerEvent, dir: ResizeDirection) => {
      e.stopPropagation()
      e.currentTarget.setPointerCapture(e.pointerId)
      resizeState.current = {
        dir,
        startX: e.clientX,
        startY: e.clientY,
        startPosX: positionRef.current.x,
        startPosY: positionRef.current.y,
        startW: sizeRef.current.width,
        startH: sizeRef.current.height,
        pointerId: e.pointerId,
      }
      window.addEventListener('pointermove', stableResizeMove)
      window.addEventListener('pointerup', stableResizeUp)
    },
    [stableResizeMove, stableResizeUp]
  )

  // ── Focus ─────────────────────────────────────────────────────────────────
  // Capture phase so child stopPropagation (traffic lights, resize handles)
  // can't prevent click-to-front. Guarded so the focused window doesn't churn
  // the store on every interaction.

  const handleFocusCapture = useCallback(() => {
    if (!isFocused) onFocus()
  }, [isFocused, onFocus])

  // Remove any in-flight drag/resize listeners if the window unmounts mid-gesture
  // (e.g. Cmd+W or Close All while dragging) — the pointerup handler may never fire.
  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', stableDragMove)
      window.removeEventListener('pointerup', stableDragUp)
      window.removeEventListener('pointermove', stableResizeMove)
      window.removeEventListener('pointerup', stableResizeUp)
    }
  }, [stableDragMove, stableDragUp, stableResizeMove, stableResizeUp])

  // ── Render ────────────────────────────────────────────────────────────────

  const showTitlebar = !isFullscreen || chromeRevealed

  return (
    <motion.div
      style={
        isFullscreen
          ? {
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              zIndex,
              transformOrigin: 'center',
              pointerEvents: 'auto',
            }
          : {
              position: 'absolute',
              left: position.x,
              top: position.y,
              width: size.width,
              height: size.height,
              zIndex,
              transformOrigin: 'bottom center',
              pointerEvents: isMinimized ? 'none' : 'auto',
            }
      }
      className={cn(
        'flex flex-col overflow-hidden glass-window transition-[box-shadow] duration-200',
        isFullscreen ? 'rounded-none' : 'rounded-[14px]',
        isFullscreen ? '' : isFocused ? 'window-shadow-focused' : 'window-shadow-unfocused'
      )}
      initial={{ scale: 0.96, opacity: 0, y: 10 }}
      animate={
        isMinimized
          ? { scale: 0.2, opacity: 0, y: 180 }
          : { scale: 1, opacity: 1, y: 0 }
      }
      exit={{ scale: 0.95, opacity: 0, transition: { duration: 0.14, ease: [0.4, 0, 1, 1] } }}
      transition={{ type: 'spring', stiffness: 460, damping: 34, mass: 0.7 }}
      onPointerDownCapture={handleFocusCapture}
    >
      {/* Fullscreen: a thin top hover-zone reveals the auto-hidden titlebar */}
      {isFullscreen && !chromeRevealed && (
        <div
          className="absolute top-0 inset-x-0 h-2.5 z-50"
          onMouseEnter={() => setChromeRevealed(true)}
        />
      )}

      {/* Title bar — drag handle (auto-hides in fullscreen) */}
      <motion.div
        className="shrink-0 overflow-hidden"
        animate={{ height: showTitlebar ? 38 : 0 }}
        transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        onMouseLeave={() => {
          if (isFullscreen) setChromeRevealed(false)
        }}
        style={
          isFullscreen ? { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 49 } : undefined
        }
      >
        <WindowTitlebar
          title={title}
          isFocused={isFocused}
          isFullscreen={isFullscreen}
          onClose={onClose}
          onMinimize={onMinimize}
          onMaximize={onMaximize}
          onFullscreen={onFullscreen}
          onPointerDown={isFullscreen ? () => {} : handleDragStart}
        />
      </motion.div>

      {/* App content — selectable, isolated per-window Suspense boundary so a
          newly-opened lazy app suspends only ITS window (never remounting
          siblings, which is what made every window replay its entrance). */}
      <div className="flex-1 overflow-hidden relative bg-[#1c1c1e] select-text">
        <Suspense fallback={<WindowLoading />}>{children}</Suspense>
      </div>

      {/* Resize handles — not in fullscreen */}
      {!isFullscreen &&
        RESIZE_HANDLES.map(({ dir, className, cursor }) => (
          <div
            key={dir}
            className={`${className} ${cursor} z-40`}
            onPointerDown={(e) => handleResizeStart(e, dir)}
          />
        ))}
    </motion.div>
  )
}
