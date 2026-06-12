'use client'

import { useEffect, useCallback, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useWindowStore } from '@/stores/use-window-store'
import { getAppById } from '@/config/app-registry'
import { WindowFrame } from '@/components/window/window-frame'
import { AppIcon } from './app-icon'
import { Menubar } from './menubar'
import { Dock } from './dock'
import { Wallpaper } from './wallpaper'
import { BootScreen } from './boot-screen'
import { Spotlight } from './spotlight'
import { MissionControl } from './mission-control'
import type { AppId } from '@/types/window'

// Desktop shortcut apps (top-left grid)
const DESKTOP_SHORTCUTS: AppId[] = ['finder', 'textedit', 'terminal', 'projects']
const SIGNAL_SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

interface ContextMenuState {
  x: number
  y: number
}

export function Desktop() {
  const instances = useWindowStore((s) => s.instances)
  const instanceOrder = useWindowStore((s) => s.instanceOrder)
  const closeApp = useWindowStore((s) => s.closeApp)
  const closeAll = useWindowStore((s) => s.closeAll)
  const minimizeApp = useWindowStore((s) => s.minimizeApp)
  const zoomApp = useWindowStore((s) => s.zoomApp)
  const focusApp = useWindowStore((s) => s.focusApp)
  const launchAppStore = useWindowStore((s) => s.launchApp)
  const spaces = useWindowStore((s) => s.spaces)
  const currentSpaceId = useWindowStore((s) => s.currentSpaceId)
  const missionControlOpen = useWindowStore((s) => s.missionControlOpen)
  const switchSpace = useWindowStore((s) => s.switchSpace)
  const setMissionControl = useWindowStore((s) => s.setMissionControl)
  const toggleFullscreen = useWindowStore((s) => s.toggleFullscreen)

  // Boot once per browser session (no replay on refresh)
  const [bootComplete, setBootComplete] = useState(() => {
    if (typeof window === 'undefined') return false
    try {
      return sessionStorage.getItem('booted') === '1'
    } catch {
      return false
    }
  })
  const [spotlightOpen, setSpotlightOpen] = useState(false)
  const [selectedIcon, setSelectedIcon] = useState<AppId | null>(null)
  const [launchingIcon, setLaunchingIcon] = useState<AppId | null>(null)
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [signalOpen, setSignalOpen] = useState(false)
  const signalSequenceRef = useRef<string[]>([])
  const signalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // All windows live in ONE always-mounted list; a window not on the current
  // Space is hidden (display:none) rather than unmounted — so app state survives
  // Space switches AND fullscreen toggles (no remount). Focus = topmost
  // non-minimized window in the current Space (the fullscreen window when its
  // own Space is current).
  const focusedInstanceId =
    [...instanceOrder]
      .reverse()
      .find(
        (id) => instances[id] && instances[id].spaceId === currentSpaceId && !instances[id].isMinimized
      ) ?? null

  const launchApp = useCallback(
    (appId: AppId) => {
      const appDef = getAppById(appId)
      if (!appDef) return
      launchAppStore(appId, appDef.windowConstraints, appDef.name)
    },
    [launchAppStore]
  )

  const handleIconLaunch = useCallback(
    (appId: AppId) => {
      if (launchingIcon) return
      setLaunchingIcon(appId)
      setSelectedIcon(appId)
      setTimeout(() => {
        launchApp(appId)
        setLaunchingIcon(null)
      }, 220)
    },
    [launchApp, launchingIcon]
  )

  const handleBootComplete = useCallback(() => {
    setBootComplete(true)
    try {
      sessionStorage.setItem('booted', '1')
    } catch {
      /* ignore */
    }
  }, [])

  // Clear desktop selection / context menu when clicking empty desktop
  const handleDesktopClick = useCallback(() => {
    setSelectedIcon(null)
    setContextMenu(null)
  }, [])

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setSelectedIcon(null)
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // Switch only among DESKTOP spaces (arrows never drop into another window's
  // fullscreen Space — fullscreen is entered via the green button / Ctrl+Cmd+F).
  const stepSpace = useCallback(
    (delta: number) => {
      const desktops = spaces.filter((s) => s.kind === 'desktop')
      if (desktops.length === 0) return
      const idx = desktops.findIndex((s) => s.id === currentSpaceId)
      if (idx === -1) {
        switchSpace(desktops[0].id) // from a fullscreen Space → first desktop
        return
      }
      const next = Math.min(Math.max(idx + delta, 0), desktops.length - 1)
      switchSpace(desktops[next].id)
    },
    [spaces, currentSpaceId, switchSpace]
  )

  // Trackpad gestures — the only trackpad signal a browser receives is `wheel`.
  // A 2-finger horizontal swipe over the desktop switches Spaces; a strong swipe
  // up opens Mission Control. Neither collides with macOS system shortcuts.
  const gestureLock = useRef(false)
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (gestureLock.current) return
      if ((e.target as HTMLElement).closest('[data-window]')) return // over a window → let it scroll
      const ax = Math.abs(e.deltaX)
      const ay = Math.abs(e.deltaY)
      if (ax > 38 && ax > ay * 1.4) {
        gestureLock.current = true
        stepSpace(e.deltaX > 0 ? 1 : -1)
        setTimeout(() => {
          gestureLock.current = false
        }, 480)
      } else if (e.deltaY > 42 && ay > ax * 1.4 && !missionControlOpen) {
        // Swipe UP opens Mission Control (natural scrolling → up = positive deltaY)
        gestureLock.current = true
        setMissionControl(true)
        setTimeout(() => {
          gestureLock.current = false
        }, 480)
      }
    },
    [stepSpace, missionControlOpen, setMissionControl]
  )

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey
      const target = e.target as HTMLElement | null
      const isEditable =
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable

      if (!isEditable) {
        signalSequenceRef.current = [...signalSequenceRef.current, e.key].slice(-SIGNAL_SEQUENCE.length)
        const unlocked = SIGNAL_SEQUENCE.every(
          (key, index) => signalSequenceRef.current[index] === key
        )
        if (unlocked) {
          setSignalOpen(true)
          signalSequenceRef.current = []
          if (signalTimerRef.current) clearTimeout(signalTimerRef.current)
          signalTimerRef.current = setTimeout(() => setSignalOpen(false), 7200)
        }
      }

      // Mission Control — Ctrl+Up or F3 (F3 guarded against stray modifiers)
      if (
        (e.ctrlKey && !e.metaKey && e.key === 'ArrowUp') ||
        (e.key === 'F3' && !e.metaKey && !e.altKey && !e.shiftKey)
      ) {
        e.preventDefault()
        setMissionControl(!missionControlOpen)
        return
      }

      // While Mission Control is open: only Space navigation + close
      if (missionControlOpen) {
        if (e.key === 'Escape' || (e.ctrlKey && e.key === 'ArrowDown')) {
          e.preventDefault()
          setMissionControl(false)
        } else if (e.ctrlKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
          e.preventDefault()
          stepSpace(e.key === 'ArrowRight' ? 1 : -1)
        }
        return
      }

      // Ctrl+Cmd+F — toggle fullscreen on the focused window
      if (e.ctrlKey && e.metaKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault()
        if (focusedInstanceId) toggleFullscreen(focusedInstanceId)
        return
      }

      // Ctrl+Left / Ctrl+Right — switch Spaces
      if (e.ctrlKey && !e.metaKey && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        e.preventDefault()
        stepSpace(e.key === 'ArrowRight' ? 1 : -1)
        return
      }

      // Cmd+Space — toggle Spotlight
      if (mod && e.key === ' ') {
        e.preventDefault()
        setSpotlightOpen((open) => !open)
        return
      }

      // While Spotlight is open, let it own keyboard input
      if (spotlightOpen) return

      // Cmd+W / Cmd+Q — close focused window
      if (mod && (e.key === 'w' || e.key === 'q')) {
        e.preventDefault()
        if (focusedInstanceId) closeApp(focusedInstanceId)
        return
      }

      // Cmd+M — minimize focused window
      if (mod && e.key === 'm') {
        e.preventDefault()
        if (focusedInstanceId) minimizeApp(focusedInstanceId)
        return
      }

      // Enter — open the selected desktop icon
      if (e.key === 'Enter' && selectedIcon) {
        e.preventDefault()
        launchApp(selectedIcon)
        setSelectedIcon(null)
        return
      }

      // Escape — exit fullscreen first, else dismiss context menu / selection
      if (e.key === 'Escape') {
        if (
          focusedInstanceId &&
          useWindowStore.getState().instances[focusedInstanceId]?.isFullscreen
        ) {
          e.preventDefault()
          toggleFullscreen(focusedInstanceId)
          return
        }
        setContextMenu(null)
        setSelectedIcon(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    focusedInstanceId,
    closeApp,
    minimizeApp,
    spotlightOpen,
    selectedIcon,
    launchApp,
    missionControlOpen,
    setMissionControl,
    toggleFullscreen,
    stepSpace,
  ])

  useEffect(
    () => () => {
      if (signalTimerRef.current) clearTimeout(signalTimerRef.current)
    },
    []
  )

  // Menubar (and any other surface) can open Spotlight via a custom event
  useEffect(() => {
    const open = () => setSpotlightOpen(true)
    window.addEventListener('spotlight:open', open)
    return () => window.removeEventListener('spotlight:open', open)
  }, [])

  if (!bootComplete) {
    return <BootScreen onComplete={handleBootComplete} />
  }

  return (
    <>
      <div
        className="font-system fixed inset-0 overflow-hidden"
        onContextMenu={handleContextMenu}
        onClick={handleDesktopClick}
        onWheel={handleWheel}
      >
        <Wallpaper />
        <Menubar />
        <DesktopAtmosphere signalOpen={signalOpen} />

        {/* Desktop shortcut icons — top-left (covered by a fullscreen window) */}
        <div className="absolute top-[154px] left-4 flex flex-col gap-5 select-none">
          {DESKTOP_SHORTCUTS.map((appId) => {
            const appDef = getAppById(appId)
            if (!appDef) return null
            const selected = selectedIcon === appId
            const launching = launchingIcon === appId
            return (
              <motion.button
                key={appId}
                onDoubleClick={(e) => {
                  e.stopPropagation()
                  handleIconLaunch(appId)
                }}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIcon(appId)
                  setContextMenu(null)
                }}
                animate={launching
                  ? { scale: 1.28, opacity: 0, y: -8 }
                  : { scale: 1, opacity: 1, y: 0 }
                }
                transition={launching
                  ? { duration: 0.2, ease: [0.3, 0, 0.5, 1] }
                  : { type: 'spring', stiffness: 500, damping: 32, mass: 0.8 }
                }
                whileTap={{ scale: 0.88 }}
                className="flex flex-col items-center gap-1.5 w-[76px] cursor-default outline-none"
              >
                <div
                  className={`rounded-[17px] p-1 transition-all duration-100 ${
                    selected ? 'bg-[#0a84ff]/25 ring-1 ring-[#0a84ff]/40' : ''
                  }`}
                >
                  <AppIcon app={appDef} size={52} />
                </div>
                <span
                  className={`text-[12px] leading-tight text-center px-1.5 py-0.5 rounded-md ${
                    selected
                      ? 'bg-[#d7ff2f] text-black'
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  {appDef.name}
                </span>
              </motion.button>
            )
          })}
        </div>

        {/* Window area — ALL windows (every Space) live here in ONE AnimatePresence
            and stay mounted; a window not on the current Space is hidden, and a
            fullscreen window escapes this box via position:fixed. No remount on
            Space switch or fullscreen toggle → app state is preserved. */}
        <div className="absolute inset-x-0 top-7 bottom-20 overflow-hidden pointer-events-none">
          <AnimatePresence initial={false}>
            {instanceOrder.map((instanceId) => {
              const inst = instances[instanceId]
              if (!inst) return null
              const appDef = getAppById(inst.appId)
              if (!appDef) return null
              const AppComponent = appDef.component
              const isFocused = focusedInstanceId === instanceId

              return (
                <WindowFrame
                  key={instanceId}
                  instanceId={instanceId}
                  appId={inst.appId}
                  title={inst.title}
                  position={inst.position}
                  size={inst.size}
                  isMinimized={inst.isMinimized}
                  isFocused={isFocused}
                  isFullscreen={inst.isFullscreen}
                  isHidden={inst.spaceId !== currentSpaceId}
                  zIndex={inst.zIndex}
                  minSize={appDef.windowConstraints.minSize}
                  onClose={() => closeApp(instanceId)}
                  onMinimize={() => minimizeApp(instanceId)}
                  onMaximize={() => zoomApp(instanceId)}
                  onFullscreen={() => toggleFullscreen(instanceId)}
                  onFocus={() => focusApp(instanceId)}
                >
                  {/* Per-window Suspense lives INSIDE WindowFrame, so a freshly
                      opened lazy app suspends only its own window. */}
                  <AppComponent
                    instanceId={instanceId}
                    onClose={() => closeApp(instanceId)}
                    onMinimize={() => minimizeApp(instanceId)}
                    isFocused={isFocused}
                    isWindowed={true}
                  />
                </WindowFrame>
              )
            })}
          </AnimatePresence>
        </div>

        <Dock />

        <AnimatePresence>
          {signalOpen ? <SignalOverlay /> : null}
        </AnimatePresence>
      </div>

      {/* Desktop context menu */}
      <AnimatePresence>
        {contextMenu && (
          <DesktopContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onClose={() => setContextMenu(null)}
            onLaunch={launchApp}
            onCloseAll={closeAll}
            hasWindows={instanceOrder.length > 0}
          />
        )}
      </AnimatePresence>

      {/* Spotlight — rendered outside desktop div so it overlays everything */}
      <Spotlight
        isOpen={spotlightOpen}
        onClose={() => setSpotlightOpen(false)}
        onLaunchApp={(appId) => {
          launchApp(appId)
          setSpotlightOpen(false)
        }}
      />

      {/* Mission Control — Spaces + window spread (Ctrl↑ / F3 / menubar button) */}
      <MissionControl />
    </>
  )
}

function DesktopAtmosphere({
  signalOpen,
}: {
  signalOpen: boolean
}) {
  const statusItems = [
    ['MODE', signalOpen ? 'SIGNAL' : 'BUILD'],
    ['FOCUS', 'AI / MARKETS / SYSTEMS'],
    ['LOCAL', 'TAIPEI'],
    ['YEAR', '2026'],
  ]
  const signalItems = [
    'Selected works',
    'Motion-first product systems',
    'Human texture over template polish',
    'Open signal',
  ]

  return (
    <div className="pointer-events-none absolute inset-0 select-none overflow-hidden">
      <motion.div
        className="desktop-hero-type absolute left-[96px] right-5 top-12"
        initial={{ opacity: 0, y: 28, filter: 'blur(8px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="font-mono text-[11px] uppercase text-[#d7ff2f]">
              Morris Yang / Product Builder
            </p>
            <h1 className="mt-3 font-display text-7xl leading-none text-white sm:text-9xl lg:text-[12rem]">
              MORRIS
            </h1>
          </div>
          <div className="hidden max-w-[320px] pt-5 text-right font-mono text-[11px] uppercase leading-5 text-white/60 md:block">
            <p>Prediction markets</p>
            <p>AI workflows</p>
            <p>Operating interfaces</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        className="desktop-status-rail grid gap-px"
        initial={{ opacity: 0, x: -22, filter: 'blur(10px)' }}
        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
        transition={{ delay: 0.35, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {statusItems.map(([label, value], index) => (
          <div key={label} className="desktop-status-cell px-3 py-2">
            <span className="block font-mono text-[10px] text-white/42">{label}</span>
            <span className="mt-1 block truncate font-mono text-[12px] uppercase text-white/85">
              {value}
            </span>
            <span
              className="desktop-cell-meter mt-2 block h-px"
              style={{ animationDelay: `${index * 0.35}s` }}
            />
          </div>
        ))}
      </motion.div>

      <motion.div
        className="desktop-signal-strip"
        initial={{ opacity: 0, x: 24 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.55, duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className="desktop-signal-track">
          {[...signalItems, ...signalItems, ...signalItems].map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

function SignalOverlay() {
  return (
    <motion.div
      className="signal-overlay pointer-events-none fixed inset-0 z-[8500] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.22 }}
    >
      <motion.div
        className="signal-core px-6 py-5 text-center"
        initial={{ scale: 0.86, rotate: -1.5 }}
        animate={{ scale: 1, rotate: 0 }}
        exit={{ scale: 1.08, rotate: 1.5 }}
        transition={{ type: 'spring', stiffness: 280, damping: 24 }}
      >
        <p className="font-mono text-[11px] uppercase text-[#d7ff2f]">hidden signal unlocked</p>
        <p className="mt-2 font-display text-5xl leading-none text-white sm:text-7xl">20:26</p>
        <p className="mt-2 font-mono text-[11px] uppercase text-white/60">
          Portfolio machine is now dreaming in public
        </p>
      </motion.div>
    </motion.div>
  )
}

// ─── Desktop context menu ──────────────────────────────────────────────────────

function DesktopContextMenu({
  x,
  y,
  onClose,
  onLaunch,
  onCloseAll,
  hasWindows,
}: {
  x: number
  y: number
  onClose: () => void
  onLaunch: (appId: AppId) => void
  onCloseAll: () => void
  hasWindows: boolean
}) {
  // Keep the menu on screen
  const left = Math.min(x, (typeof window !== 'undefined' ? window.innerWidth : 1280) - 230)
  const top = Math.min(y, (typeof window !== 'undefined' ? window.innerHeight : 800) - 230)

  const item =
    'w-full text-left px-3 py-1.5 text-[13px] text-white/90 rounded-md hover:bg-[#0a84ff] hover:text-white transition-colors cursor-default'
  const divider = 'my-1 h-px bg-white/10'

  return (
    <>
      <div className="fixed inset-0 z-ctx-backdrop" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
        style={{ left, top, transformOrigin: 'top left' }}
        className="font-system glass-panel fixed z-ctx-menu w-[220px] rounded-xl p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={item} onClick={() => { onLaunch('finder'); onClose() }}>Open Finder</button>
        <button className={item} onClick={() => { onLaunch('about'); onClose() }}>About Morris</button>
        <button className={item} onClick={() => { onLaunch('terminal'); onClose() }}>Open Terminal</button>
        <button className={item} onClick={() => { onLaunch('textedit'); onClose() }}>Open TextEdit</button>
        <div className={divider} />
        <button className={item} onClick={() => { onLaunch('reel'); onClose() }}>the algorithm sent me</button>
        {hasWindows && (
          <>
            <div className={divider} />
            <button className={item} onClick={() => { onCloseAll(); onClose() }}>Close All Windows</button>
          </>
        )}
      </motion.div>
    </>
  )
}
