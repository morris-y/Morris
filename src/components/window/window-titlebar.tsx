'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface WindowTitlebarProps {
  title: string
  isFocused?: boolean
  isFullscreen?: boolean
  onClose: () => void
  onMinimize: () => void
  /** Zoom = fill the work area (double-click the titlebar) */
  onMaximize?: () => void
  /** Fullscreen = the green traffic light (macOS) */
  onFullscreen?: () => void
  onPointerDown: (e: React.PointerEvent) => void
}

export function WindowTitlebar({
  title,
  isFocused = true,
  isFullscreen = false,
  onClose,
  onMinimize,
  onMaximize,
  onFullscreen,
  onPointerDown,
}: WindowTitlebarProps) {
  const [isHoveringGroup, setIsHoveringGroup] = useState(false)
  const showGlyphs = isHoveringGroup && isFocused

  return (
    <div
      className={cn(
        'flex items-center h-[38px] px-3 shrink-0 select-none transition-all duration-200',
        isFocused ? 'glass-titlebar' : 'glass-titlebar-unfocused'
      )}
      style={{
        boxShadow: isFocused
          ? 'inset 0 1.5px 0 rgba(255,255,255,0.28), inset 0 0.5px 0 rgba(255,255,255,0.45)'
          : 'inset 0 1px 0 rgba(255,255,255,0.08)',
      }}
      onPointerDown={onPointerDown}
      onDoubleClick={() => onMaximize?.()}
    >
      {/* Traffic light group */}
      <div
        className="flex items-center gap-[8px] z-10"
        onMouseEnter={() => setIsHoveringGroup(true)}
        onMouseLeave={() => setIsHoveringGroup(false)}
      >
        {/* Red — close */}
        <TrafficLight
          color={isFocused ? '#ff5f57' : '#3f3f43'}
          glyphColor="#7a0a00"
          label="Close"
          onClick={onClose}
          showGlyph={showGlyphs}
          glyph="✕"
        />
        {/* Yellow — minimize */}
        <TrafficLight
          color={isFocused ? '#febc2e' : '#3f3f43'}
          glyphColor="#7a5600"
          label="Minimize"
          onClick={onMinimize}
          showGlyph={showGlyphs}
          glyph="−"
        />
        {/* Green — fullscreen (macOS). Double-click the titlebar = zoom. */}
        <TrafficLight
          color={isFocused ? '#28c840' : '#3f3f43'}
          glyphColor="#004d0f"
          label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
          onClick={() => onFullscreen?.()}
          showGlyph={showGlyphs}
          glyph={isFullscreen ? '⤡' : '⤢'}
        />
      </div>

      {/* Centered title */}
      <div className="absolute left-0 right-0 flex justify-center pointer-events-none">
        <span
          className={cn(
            'text-[13px] font-medium truncate max-w-[55%] transition-colors duration-150',
            isFocused ? 'text-white/75' : 'text-white/35'
          )}
        >
          {title}
        </span>
      </div>
    </div>
  )
}

function TrafficLight({
  color,
  glyphColor,
  label,
  onClick,
  showGlyph,
  glyph,
}: {
  color: string
  glyphColor: string
  label: string
  onClick: () => void
  showGlyph: boolean
  glyph: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="w-[12px] h-[12px] rounded-full flex items-center justify-center shrink-0 focus:outline-none"
      style={{
        background: color,
        // glossy jewel: subtle top sheen + crisp edge
        boxShadow:
          'inset 0 0.5px 0.5px rgba(255,255,255,0.55), inset 0 -1px 1px rgba(0,0,0,0.22), 0 0 0 0.5px rgba(0,0,0,0.20)',
      }}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      {showGlyph && (
        <span
          className="text-[9px] font-bold leading-none"
          style={{ color: glyphColor }}
        >
          {glyph}
        </span>
      )}
    </button>
  )
}
