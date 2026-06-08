'use client'

import { useMemo } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Plus, X, Maximize2 } from 'lucide-react'
import { useWindowStore } from '@/stores/use-window-store'
import { getAppById } from '@/config/app-registry'
import { AppIcon } from './app-icon'
import type { AppInstance, Space } from '@/types/window'

function vw() {
  return typeof window !== 'undefined' ? window.innerWidth : 1440
}
function vh() {
  return typeof window !== 'undefined' ? window.innerHeight : 900
}

/**
 * Mission Control — zooms out to show every window in the current Space tiled,
 * with a Spaces bar across the top for switching / adding / closing desktops
 * (and fullscreen apps, which are their own Space). Reads everything from the
 * window store; mounts its overlay only while `missionControlOpen`.
 */
export function MissionControl() {
  const open = useWindowStore((s) => s.missionControlOpen)
  const instances = useWindowStore((s) => s.instances)
  const instanceOrder = useWindowStore((s) => s.instanceOrder)
  const spaces = useWindowStore((s) => s.spaces)
  const currentSpaceId = useWindowStore((s) => s.currentSpaceId)
  const setMissionControl = useWindowStore((s) => s.setMissionControl)
  const switchSpace = useWindowStore((s) => s.switchSpace)
  const addSpace = useWindowStore((s) => s.addSpace)
  const removeSpace = useWindowStore((s) => s.removeSpace)
  const focusApp = useWindowStore((s) => s.focusApp)
  const closeApp = useWindowStore((s) => s.closeApp)

  const desktopSpaceCount = useMemo(
    () => spaces.filter((s) => s.kind === 'desktop').length,
    [spaces]
  )

  // Windows of the current Space, in stacking order
  const currentWindows = useMemo(
    () =>
      instanceOrder
        .map((id) => instances[id])
        .filter((inst): inst is AppInstance => !!inst && inst.spaceId === currentSpaceId),
    [instanceOrder, instances, currentSpaceId]
  )

  const selectWindow = (inst: AppInstance) => {
    if (inst.spaceId !== currentSpaceId) switchSpace(inst.spaceId)
    focusApp(inst.instanceId)
    setMissionControl(false)
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mission-control"
          className="font-system fixed inset-0 z-[9500] flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: [0.32, 0.72, 0, 1] }}
          style={{
            background: 'rgba(10,10,14,0.55)',
            backdropFilter: 'blur(28px) saturate(150%)',
            WebkitBackdropFilter: 'blur(28px) saturate(150%)',
          }}
          onClick={() => setMissionControl(false)}
          onWheel={(e) => {
            // Swipe DOWN collapses Mission Control (natural scrolling → down = negative deltaY)
            if (e.deltaY < -40) setMissionControl(false)
          }}
        >
          {/* ── Spaces bar ─────────────────────────────────────────────── */}
          <motion.div
            className="flex shrink-0 items-center justify-center gap-3 px-6 pt-5 pb-3"
            initial={{ y: -24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -24, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.32, 0.72, 0, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-end gap-3 overflow-x-auto scrollbar-none px-1 py-1">
              {spaces.map((space, i) => (
                <SpaceThumb
                  key={space.id}
                  space={space}
                  index={i}
                  instances={instances}
                  isCurrent={space.id === currentSpaceId}
                  canClose={space.kind === 'fullscreen' || desktopSpaceCount > 1}
                  onClick={() => switchSpace(space.id)}
                  onClose={() => removeSpace(space.id)}
                />
              ))}

              {/* Add desktop */}
              <button
                onClick={addSpace}
                className="group/add flex h-[88px] w-[150px] shrink-0 flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/25 text-white/55 transition-colors hover:border-white/50 hover:bg-white/5 hover:text-white/85"
                title="Add a desktop"
              >
                <Plus size={22} strokeWidth={2} />
                <span className="text-[11px] font-medium">New Desktop</span>
              </button>
            </div>
          </motion.div>

          {/* ── Window grid (current Space) ────────────────────────────── */}
          <div
            className="flex flex-1 items-center justify-center overflow-y-auto scrollbar-none px-10 pb-10"
            onClick={() => setMissionControl(false)}
          >
            {currentWindows.length === 0 ? (
              <p className="select-none text-[15px] text-white/45">
                No windows on this desktop — open an app from the Dock.
              </p>
            ) : (
              <div
                className="flex max-w-[1100px] flex-wrap items-center justify-center gap-7"
                onClick={(e) => e.stopPropagation()}
              >
                {currentWindows.map((inst, i) => (
                  <WindowTile
                    key={inst.instanceId}
                    inst={inst}
                    index={i}
                    onSelect={() => selectWindow(inst)}
                    onClose={() => closeApp(inst.instanceId)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* hint */}
          <div className="pointer-events-none shrink-0 pb-4 text-center text-[11px] tracking-wide text-white/40">
            Ctrl ↑ Mission Control · Ctrl ← → switch desktop · Esc to close
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ── Space thumbnail (a mini desktop with its windows as tiny tiles) ───────── */

function SpaceThumb({
  space,
  index,
  instances,
  isCurrent,
  canClose,
  onClick,
  onClose,
}: {
  space: Space
  index: number
  instances: Record<string, AppInstance>
  isCurrent: boolean
  canClose: boolean
  onClick: () => void
  onClose: () => void
}) {
  const THUMB_W = 150
  const THUMB_H = 88
  const screenW = vw()
  const screenH = vh()

  const spaceWindows = Object.values(instances).filter((i) => i.spaceId === space.id)
  const fsApp = space.fullscreenInstanceId ? instances[space.fullscreenInstanceId] : undefined
  const fsDef = fsApp ? getAppById(fsApp.appId) : undefined

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.04 * index, duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
      className="group/space relative shrink-0"
    >
      <button
        onClick={onClick}
        className={`relative block overflow-hidden rounded-lg border transition-all duration-200 ${
          isCurrent
            ? 'border-white/90 ring-2 ring-white/80'
            : 'border-white/20 hover:border-white/45'
        }`}
        style={{ width: THUMB_W, height: THUMB_H }}
      >
        {space.kind === 'fullscreen' && fsDef ? (
          // Fullscreen Space → the app fills the whole thumbnail
          <div
            className="flex h-full w-full flex-col items-center justify-center gap-1.5"
            style={{ background: fsDef.gradientCss }}
          >
            <Maximize2 size={16} className="text-white/85" strokeWidth={2} />
            <span className="px-2 text-center text-[10px] font-semibold text-white/95 line-clamp-1">
              {fsApp?.title ?? fsDef.name}
            </span>
          </div>
        ) : (
          // Desktop Space → wallpaper + tiny window rects positioned proportionally
          <div className="wallpaper-tahoe relative h-full w-full">
            {spaceWindows
              .filter((w) => !w.isMinimized)
              .map((w) => {
                const left = Math.max(0, (w.position.x / screenW) * THUMB_W)
                const top = Math.max(2, ((w.position.y + 28) / screenH) * THUMB_H)
                const width = Math.min(THUMB_W - left - 2, (w.size.width / screenW) * THUMB_W)
                const height = Math.min(THUMB_H - top - 2, (w.size.height / screenH) * THUMB_H)
                const def = getAppById(w.appId)
                return (
                  <div
                    key={w.instanceId}
                    className="absolute rounded-[3px] border border-white/30 shadow-sm"
                    style={{
                      left,
                      top,
                      width: Math.max(10, width),
                      height: Math.max(8, height),
                      background: def?.gradientCss ?? 'rgba(40,40,45,0.9)',
                      opacity: 0.92,
                    }}
                  />
                )
              })}
          </div>
        )}
      </button>

      {/* label */}
      <p
        className={`mt-1 text-center text-[11px] font-medium transition-colors ${
          isCurrent ? 'text-white' : 'text-white/55'
        }`}
      >
        {space.kind === 'fullscreen' ? fsDef?.name ?? 'App' : space.name}
      </p>

      {/* close (✕) */}
      {canClose && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          className="absolute -left-1.5 -top-1.5 grid h-5 w-5 place-items-center rounded-full bg-black/80 text-white/90 opacity-0 ring-1 ring-white/30 transition-opacity group-hover/space:opacity-100 hover:bg-black"
          title="Close desktop"
          aria-label="Close desktop"
        >
          <X size={11} strokeWidth={2.5} />
        </button>
      )}
    </motion.div>
  )
}

/* ── Window tile in the spread grid ────────────────────────────────────────── */

function WindowTile({
  inst,
  index,
  onSelect,
  onClose,
}: {
  inst: AppInstance
  index: number
  onSelect: () => void
  onClose: () => void
}) {
  const def = getAppById(inst.appId)
  if (!def) return null

  // Scale the real window aspect into a tile, capped to a sensible size.
  const maxW = 320
  const ratio = inst.size.height / inst.size.width
  const tileW = Math.min(maxW, inst.size.width)
  const tileH = Math.max(120, Math.min(240, tileW * ratio))

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.85, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.05 + index * 0.04, type: 'spring', stiffness: 360, damping: 30 }}
      className="group/win relative shrink-0"
      style={{ width: tileW }}
    >
      <button
        onClick={onSelect}
        className="block w-full overflow-hidden rounded-xl border border-white/15 text-left shadow-2xl shadow-black/60 transition-transform duration-200 group-hover/win:scale-[1.04]"
        style={{ height: tileH }}
      >
        {/* faux titlebar */}
        <div className="glass-titlebar flex h-7 items-center gap-1.5 px-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          <span className="ml-2 truncate text-[11px] font-medium text-white/70">{inst.title}</span>
        </div>
        {/* body — app icon + name (representation of the window content) */}
        <div className="flex h-[calc(100%-1.75rem)] flex-col items-center justify-center gap-3 bg-[#1c1c1e]">
          <AppIcon app={def} size={Math.min(64, tileH * 0.34)} />
          <span className="text-[13px] font-medium text-white/80">{def.name}</span>
        </div>
      </button>

      {/* close (✕) */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onClose()
        }}
        className="absolute -left-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-black/80 text-white/90 opacity-0 ring-1 ring-white/30 transition-opacity group-hover/win:opacity-100 hover:bg-black"
        title="Close window"
        aria-label="Close window"
      >
        <X size={13} strokeWidth={2.5} />
      </button>
    </motion.div>
  )
}
