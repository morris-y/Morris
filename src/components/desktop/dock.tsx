'use client'

import { useRef, useCallback, useState } from 'react'
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
  type MotionValue,
} from 'motion/react'
import { Folder, Trash2, type LucideIcon } from 'lucide-react'
import { useWindowStore } from '@/stores/use-window-store'
import { appRegistry, getAppById } from '@/config/app-registry'
import type { AnalogueIconConfig } from '@/types/window'

// Resting tile size. The wave drives WIDTH (not scale) so the flex row reflows
// and neighbors get pushed outward — that lateral spread is the smooth wave.
const BASE = 48
const MAX = BASE * 1.55

type Tile = {
  gradientCss: string
  Glyph: LucideIcon
  name: string
  iconConfig?: AnalogueIconConfig
}

function DockSymbol({
  symbol,
  sizeMotion,
}: {
  symbol: AnalogueIconConfig['symbol']
  sizeMotion: MotionValue<number>
}) {
  const [current, setCurrent] = useState(() => sizeMotion.get())
  useMotionValueEvent(sizeMotion, 'change', setCurrent)
  return <>{symbol(current)}</>
}

/**
 * One magnifiable squircle in the Dock. Mirrors the AppIcon visual language
 * (per-app gradient + `.app-icon-squircle` sheen + white Lucide glyph) but is
 * rendered inline here because the size must be a live motion value.
 */
function DockTile({
  tile,
  mouseX,
  hasOpenInstance = false,
  onClick,
}: {
  tile: Tile
  mouseX: MotionValue<number>
  hasOpenInstance?: boolean
  onClick: () => void
}) {
  const ref = useRef<HTMLButtonElement>(null)

  // Canonical framer-motion dock math: distance of cursor from this tile's
  // horizontal center, mapped to a size curve, smoothed by a spring.
  const distance = useTransform(mouseX, (x) => {
    const box = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 }
    return x - (box.x + box.width / 2)
  })

  const sizeT = useTransform(distance, [-150, 0, 150], [BASE, MAX, BASE], { clamp: true })
  const size = useSpring(sizeT, { mass: 0.1, stiffness: 170, damping: 14 })

  // Glyph and corner radius track the tile so the whole icon grows coherently.
  const glyphSize = useTransform(size, (v) => Math.round(v * 0.5))
  const radius = useTransform(size, (v) => Math.round(v * 0.2237))

  const { gradientCss, Glyph, name, iconConfig } = tile

  const background = iconConfig
    ? iconConfig.texture
      ? `${iconConfig.texture}, ${iconConfig.background}`
      : iconConfig.background
    : gradientCss

  return (
    <div className="group relative flex flex-col items-center justify-end">
      {/* Tooltip */}
      <motion.span
        className="glass-panel pointer-events-none absolute -top-2 -translate-y-full whitespace-nowrap rounded-lg px-2.5 py-1 text-[12px] font-medium text-white/90 opacity-0 transition-opacity duration-150 group-hover:opacity-100"
        style={{ originY: 1 }}
      >
        {name}
      </motion.span>

      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-label={name}
        whileTap={{ scale: 0.9 }}
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          transformOrigin: 'bottom center',
          originY: 1,
          background,
        }}
        className="app-icon-squircle flex cursor-default items-center justify-center select-none"
      >
        {iconConfig ? (
          <motion.span
            className="flex items-center justify-center"
            style={{
              width: glyphSize,
              height: glyphSize,
              ...(iconConfig.glowColor && {
                filter: `drop-shadow(0 0 6px ${iconConfig.glowColor})`,
              }),
            }}
          >
            <DockSymbol symbol={iconConfig.symbol} sizeMotion={size} />
          </motion.span>
        ) : (
          <motion.span
            className="flex items-center justify-center"
            style={{ width: glyphSize, height: glyphSize }}
          >
            <Glyph
              size="100%"
              strokeWidth={2}
              className="relative text-white"
              style={{ filter: 'drop-shadow(0 1px 1.5px rgba(0,0,0,0.35))' }}
            />
          </motion.span>
        )}
      </motion.button>

      {/* Running-app indicator dot */}
      <div className="mt-1 flex h-[3px] items-center justify-center">
        <AnimatePresence>
          {hasOpenInstance && (
            <motion.div
              key="dot"
              className="h-[3px] w-[3px] rounded-full bg-white/80"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.15 }}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function Separator() {
  return <div className="my-1 h-9 w-px self-center bg-white/15" />
}

export function Dock() {
  const instances = useWindowStore((s) => s.instances)
  const launchApp = useWindowStore((s) => s.launchApp)
  const closeAll = useWindowStore((s) => s.closeAll)

  const mouseX = useMotionValue(Infinity)

  // clientX matches getBoundingClientRect()'s coordinate space (the desktop is
  // fixed + non-scrolling, but clientX is correct regardless of scroll).
  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => mouseX.set(e.clientX),
    [mouseX]
  )
  const handleMouseLeave = useCallback(() => mouseX.set(Infinity), [mouseX])

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-3 z-dock flex justify-center">
      <div
        className="glass-dock pointer-events-auto flex items-end gap-[10px] rounded-[26px] px-3 py-2"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* Finder — pinned far-left */}
        <DockTile
          tile={{
            gradientCss:
              'radial-gradient(ellipse at 38% 28%, #70C8FF 0%, #2478E8 50%, #0D3EA8 100%)',
            Glyph: Folder,
            name: 'Finder',
          }}
          mouseX={mouseX}
          onClick={() => {
            const about = getAppById('about')
            if (about) launchApp(about.id, about.windowConstraints, about.name)
          }}
        />

        <Separator />

        {/* Pinned applications */}
        {appRegistry.map((app) => {
          const hasOpenInstance = Object.values(instances).some(
            (inst) => inst.appId === app.id
          )
          return (
            <DockTile
              key={app.id}
              tile={{ gradientCss: app.gradientCss, Glyph: app.Glyph, name: app.name, iconConfig: app.iconConfig }}
              mouseX={mouseX}
              hasOpenInstance={hasOpenInstance}
              onClick={() => launchApp(app.id, app.windowConstraints, app.name)}
            />
          )
        })}

        {/* A minimized app keeps its running-dot on its pinned tile; clicking that
            tile restores it (launchApp un-minimizes), so single-instance apps need
            no separate minimized section. */}

        <Separator />

        {/* Trash — pinned far-right */}
        <DockTile
          tile={{
            gradientCss:
              'radial-gradient(ellipse at 40% 30%, #6E6E73 0%, #3A3A3C 52%, #161618 100%)',
            Glyph: Trash2,
            name: 'Trash',
          }}
          mouseX={mouseX}
          onClick={() => closeAll()}
        />
      </div>
    </div>
  )
}
