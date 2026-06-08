'use client'

import { useEffect, useCallback, useState } from 'react'
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
import type { AppId } from '@/types/window'

// Desktop shortcut apps (top-left grid)
const DESKTOP_SHORTCUTS: AppId[] = ['notes', 'terminal', 'projects']

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
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)

  // Focus is the topmost NON-minimized window. Minimizing therefore hands focus
  // (and keyboard shortcuts + the menubar's active app) to the window behind it.
  const focusedInstanceId =
    [...instanceOrder].reverse().find((id) => instances[id] && !instances[id].isMinimized) ?? null

  const launchApp = useCallback(
    (appId: AppId) => {
      const appDef = getAppById(appId)
      if (!appDef) return
      launchAppStore(appId, appDef.windowConstraints, appDef.name)
    },
    [launchAppStore]
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

  // Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const mod = e.metaKey || e.ctrlKey

      // Cmd+Space — toggle Spotlight (works regardless of state)
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

      // Escape — dismiss context menu / selection
      if (e.key === 'Escape') {
        setContextMenu(null)
        setSelectedIcon(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [focusedInstanceId, closeApp, minimizeApp, spotlightOpen, selectedIcon, launchApp])

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
      >
        <Wallpaper />
        <Menubar />

        {/* Desktop shortcut icons — top-left */}
        <div className="absolute top-10 left-4 flex flex-col gap-5 pt-3 select-none">
          {DESKTOP_SHORTCUTS.map((appId) => {
            const appDef = getAppById(appId)
            if (!appDef) return null
            const selected = selectedIcon === appId
            return (
              <button
                key={appId}
                onDoubleClick={() => launchApp(appId)}
                onClick={(e) => {
                  e.stopPropagation()
                  setSelectedIcon(appId)
                  setContextMenu(null)
                }}
                className="flex flex-col items-center gap-1.5 w-[76px] group cursor-default outline-none"
              >
                <div
                  className={`rounded-[15px] transition-transform duration-150 group-active:scale-95 ${
                    selected ? 'ring-2 ring-white/70 ring-offset-0' : ''
                  }`}
                >
                  <AppIcon app={appDef} size={52} />
                </div>
                <span
                  className={`text-[12px] leading-tight text-center px-1.5 py-0.5 rounded-md ${
                    selected
                      ? 'bg-[#0a84ff] text-white'
                      : 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.85)]'
                  }`}
                >
                  {appDef.name}
                </span>
              </button>
            )
          })}
        </div>

        {/* Window area — between menubar (28px) and dock area (80px) */}
        <div className="absolute inset-x-0 top-7 bottom-20 overflow-hidden pointer-events-none">
          <AnimatePresence>
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
                  zIndex={inst.zIndex}
                  minSize={appDef.windowConstraints.minSize}
                  onClose={() => closeApp(instanceId)}
                  onMinimize={() => minimizeApp(instanceId)}
                  onMaximize={() => zoomApp(instanceId)}
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
    </>
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
      <div className="fixed inset-0 z-[7000]" onClick={onClose} onContextMenu={(e) => { e.preventDefault(); onClose() }} />
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.12, ease: [0.4, 0, 0.2, 1] }}
        style={{ left, top, transformOrigin: 'top left' }}
        className="font-system glass-panel fixed z-[7001] w-[220px] rounded-xl p-1.5"
        onClick={(e) => e.stopPropagation()}
      >
        <button className={item} onClick={() => { onLaunch('about'); onClose() }}>About Morris</button>
        <button className={item} onClick={() => { onLaunch('terminal'); onClose() }}>Open Terminal</button>
        <button className={item} onClick={() => { onLaunch('notes'); onClose() }}>Open Notes</button>
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
