'use client'

import type { AppDefinition } from '@/types/window'

/**
 * macOS-style squircle app icon. When `iconConfig` is present, renders analogue
 * material background + symbol. Falls back to `gradientCss` + `Glyph` otherwise.
 */
export function AppIcon({
  app,
  size = 52,
  radius,
  className = '',
}: {
  app: Pick<AppDefinition, 'gradientCss' | 'Glyph' | 'name' | 'iconConfig'>
  size?: number
  radius?: number
  className?: string
}) {
  const { gradientCss, Glyph, iconConfig } = app
  const glyphSize = Math.round(size * 0.50)

  const background = iconConfig
    ? iconConfig.texture
      ? `${iconConfig.texture}, ${iconConfig.background}`
      : iconConfig.background
    : gradientCss

  return (
    <div
      aria-hidden
      className={`app-icon-squircle flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: radius, background }}
    >
      {iconConfig ? (
        <div
          className="relative flex items-center justify-center"
          style={
            iconConfig.glowColor
              ? { filter: `drop-shadow(0 0 ${Math.round(size * 0.12)}px ${iconConfig.glowColor})` }
              : undefined
          }
        >
          {iconConfig.symbol(size)}
        </div>
      ) : (
        <Glyph
          size={glyphSize}
          strokeWidth={1.9}
          className="relative text-white"
          style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.42))' }}
        />
      )}
    </div>
  )
}
