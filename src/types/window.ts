import type React from 'react'
import type { LucideIcon } from 'lucide-react'

export interface AnalogueIconConfig {
  /** CSS background value for the squircle base (radial-gradient, etc.) */
  background: string
  /** Optional CSS background overlay — grain, lines, weave. Layered on top of `background`. */
  texture?: string
  /** Symbol rendered centered on the icon. Receives icon pixel size for scaling. */
  symbol: (size: number) => React.ReactNode
  /** Optional glow color for luminous symbols (e.g. Terminal green `$_`). */
  glowColor?: string
}

export type AppId = 'notes' | 'projects' | 'netflix' | 'terminal' | 'about' | 'contact' | 'reel'

export interface WindowPosition {
  x: number
  y: number
}

export interface WindowSize {
  width: number
  height: number
}

export interface WindowConstraints {
  defaultSize: WindowSize
  minSize?: WindowSize
}

export interface AppInstance {
  instanceId: string
  appId: AppId
  isMinimized: boolean
  isZoomed: boolean
  /** Frame to restore to when un-zooming (set while zoomed) */
  prevFrame?: { position: WindowPosition; size: WindowSize }
  position: WindowPosition
  size: WindowSize
  title: string
  zIndex: number
}

export interface AppWindowProps {
  instanceId: string
  onClose: () => void
  onMinimize: () => void
  isFocused: boolean
  isWindowed?: boolean
}

export interface AppDefinition {
  id: AppId
  name: string
  /** Emoji fallback (legacy / accessibility) */
  icon: string
  /** Full CSS gradient string for the squircle background (radial or linear) */
  gradientCss: string
  /** Lucide glyph rendered inside the squircle */
  Glyph: LucideIcon
  /** Analogue icon config — overrides gradientCss + Glyph when present */
  iconConfig?: AnalogueIconConfig
  description: string
  windowConstraints: WindowConstraints
  component: React.ComponentType<AppWindowProps>
}
