'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useState } from 'react'
import {
  Apple,
  BatteryFull,
  LayoutGrid,
  Search,
  SlidersHorizontal,
  Wifi,
} from 'lucide-react'
import { useWindowStore } from '@/stores/use-window-store'
import { getAppById } from '@/config/app-registry'
import type { AppId } from '@/types/window'

/* -------------------------------------------------------------------------- */
/*  Clock                                                                     */
/* -------------------------------------------------------------------------- */

const CLOCK_FORMAT = new Intl.DateTimeFormat('en-US', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** "Mon Jun 8, 14:32" → normalised to "Mon 8 Jun  14:32". */
function formatClock(date: Date): string {
  const parts = CLOCK_FORMAT.formatToParts(date)
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((p) => p.type === type)?.value ?? ''
  const weekday = get('weekday')
  const day = get('day')
  const month = get('month')
  const hour = get('hour')
  const minute = get('minute')
  return `${weekday} ${day} ${month} ${hour}:${minute}`
}

/* -------------------------------------------------------------------------- */
/*  Menu primitives                                                           */
/* -------------------------------------------------------------------------- */

type MenuId = 'apple' | 'app' | 'file' | 'window'

const itemBase =
  'flex w-full items-center justify-between gap-6 rounded-md px-2.5 py-1 text-left text-[13px] leading-none text-white/90 transition-colors'
const itemEnabled = 'hover:bg-[#0a84ff] hover:text-white cursor-default'
const itemDisabled = 'text-white/30 cursor-default'

function MenuItem({
  label,
  shortcut,
  disabled,
  onSelect,
}: {
  label: string
  shortcut?: string
  disabled?: boolean
  onSelect?: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (disabled) return
        onSelect?.()
      }}
      className={`${itemBase} ${disabled ? itemDisabled : itemEnabled}`}
    >
      <span className="truncate">{label}</span>
      {shortcut ? (
        <span className="text-[12px] tabular-nums opacity-60">{shortcut}</span>
      ) : null}
    </button>
  )
}

function MenuDivider() {
  return <div className="mx-1 my-1 h-px bg-white/10" />
}

/**
 * A clickable menubar title that renders its dropdown in a `.glass-panel`.
 * Open/close is fully controlled by the parent so only one menu shows at once.
 */
function MenuButton({
  id,
  openMenu,
  onToggle,
  bold,
  iconOnly,
  children,
  panel,
}: {
  id: MenuId
  openMenu: MenuId | null
  onToggle: (id: MenuId) => void
  bold?: boolean
  iconOnly?: boolean
  children: ReactNode
  panel: ReactNode
}) {
  const isOpen = openMenu === id

  return (
    <div className="relative" data-menu-root>
      <button
        type="button"
        // Hovering a *different* title while a menu is open should switch to it
        // (classic macOS behaviour) — only when something is already open.
        onMouseEnter={() => {
          if (openMenu !== null && openMenu !== id) onToggle(id)
        }}
        onClick={() => onToggle(id)}
        className={[
          'flex h-os-menubar items-center rounded-md leading-none select-none transition-colors',
          iconOnly ? 'px-2' : 'px-2.5',
          bold ? 'text-[13px] font-semibold' : 'text-[13px]',
          isOpen ? 'bg-white/15 text-white' : 'text-white/85 hover:bg-white/10',
        ].join(' ')}
      >
        {children}
      </button>

      {isOpen ? (
        <div
          role="menu"
          className="glass-panel absolute left-0 top-[calc(100%+5px)] z-menu-dropdown min-w-[210px] rounded-lg p-1"
        >
          {panel}
        </div>
      ) : null}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Menubar                                                                   */
/* -------------------------------------------------------------------------- */

export function Menubar() {
  const [clock, setClock] = useState('')
  const [openMenu, setOpenMenu] = useState<MenuId | null>(null)
  const closeMenu = useCallback(() => setOpenMenu(null), [])

  // Focused window → active app. Subscribe narrowly to avoid extra re-renders.
  const instances = useWindowStore((s) => s.instances)
  const instanceOrder = useWindowStore((s) => s.instanceOrder)
  const closeApp = useWindowStore((s) => s.closeApp)
  const minimizeApp = useWindowStore((s) => s.minimizeApp)
  const zoomApp = useWindowStore((s) => s.zoomApp)
  const launchApp = useWindowStore((s) => s.launchApp)
  const setMissionControl = useWindowStore((s) => s.setMissionControl)
  const currentSpaceId = useWindowStore((s) => s.currentSpaceId)

  // Active app = topmost non-minimized window IN THE CURRENT SPACE, so the
  // menubar always matches what's on screen and its actions hit the right
  // window (not one living on another desktop). "Finder" when none.
  const focusedId = [...instanceOrder]
    .reverse()
    .find(
      (id) =>
        instances[id] && instances[id].spaceId === currentSpaceId && !instances[id].isMinimized
    )
  const focusedAppId: AppId | undefined = focusedId
    ? instances[focusedId]?.appId
    : undefined
  const activeAppName = focusedAppId
    ? getAppById(focusedAppId)?.name ?? 'Finder'
    : 'Finder'
  const hasWindow = Boolean(focusedId)

  /* ---- Clock: tick about every 10s, not every second ---- */
  useEffect(() => {
    const tick = () => setClock(formatClock(new Date()))
    tick()
    const interval = setInterval(tick, 10_000)
    return () => clearInterval(interval)
  }, [])

  /* ---- Escape closes any open menu ---- */
  useEffect(() => {
    if (openMenu === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeMenu()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openMenu, closeMenu])

  const toggleMenu = useCallback((id: MenuId) => {
    setOpenMenu((curr) => (curr === id ? null : id))
  }, [])

  const launchAbout = useCallback(() => {
    const app = getAppById('about')
    if (app) launchApp('about', app.windowConstraints, app.name)
    closeMenu()
  }, [launchApp, closeMenu])

  const restartMac = useCallback(() => {
    try {
      sessionStorage.removeItem('booted')
    } catch {
      /* sessionStorage may be unavailable */
    }
    location.reload()
  }, [])

  const handleClose = useCallback(() => {
    if (focusedId) closeApp(focusedId)
    closeMenu()
  }, [focusedId, closeApp, closeMenu])

  const handleMinimize = useCallback(() => {
    if (focusedId) minimizeApp(focusedId)
    closeMenu()
  }, [focusedId, minimizeApp, closeMenu])

  const handleZoom = useCallback(() => {
    if (focusedId) zoomApp(focusedId)
    closeMenu()
  }, [focusedId, zoomApp, closeMenu])

  const openSpotlight = useCallback(() => {
    // Decorative hook — let any listener (e.g. a Spotlight overlay) respond.
    window.dispatchEvent(new CustomEvent('spotlight:open'))
  }, [])

  return (
    <>
      {/* Invisible click-away catcher; sits just under the menubar's z-index. */}
      {openMenu !== null ? (
        <div
          className="fixed inset-0 z-menu-backdrop"
          onClick={closeMenu}
          onContextMenu={(e) => {
            e.preventDefault()
            closeMenu()
          }}
          aria-hidden
        />
      ) : null}

      <div className="font-system fixed inset-x-0 top-0 z-menubar flex h-os-menubar items-center justify-between px-1.5 select-none glass-menubar">
        {/* ---------------------------------------------------------------- */}
        {/*  Left — Apple menu + app menus                                   */}
        {/* ---------------------------------------------------------------- */}
        <nav className="flex items-center gap-px">
          <MenuButton
            id="apple"
            openMenu={openMenu}
            onToggle={toggleMenu}
            iconOnly
            panel={
              <>
                <MenuItem label="About This Mac" onSelect={launchAbout} />
                <MenuItem label="System Settings…" onSelect={launchAbout} />
                <MenuDivider />
                <MenuItem label="Restart…" onSelect={restartMac} />
                <MenuItem label="Sleep" onSelect={closeMenu} />
              </>
            }
          >
            <Apple size={15} strokeWidth={0} fill="currentColor" />
          </MenuButton>

          <MenuButton
            id="app"
            openMenu={openMenu}
            onToggle={toggleMenu}
            bold
            panel={
              <>
                <MenuItem
                  label={`About ${activeAppName}`}
                  onSelect={launchAbout}
                />
                <MenuDivider />
                <MenuItem
                  label={`Hide ${activeAppName}`}
                  shortcut="⌘H"
                  disabled={!hasWindow}
                  onSelect={handleMinimize}
                />
                <MenuItem
                  label={`Quit ${activeAppName}`}
                  shortcut="⌘Q"
                  disabled={!hasWindow}
                  onSelect={handleClose}
                />
              </>
            }
          >
            {activeAppName}
          </MenuButton>

          <MenuButton
            id="file"
            openMenu={openMenu}
            onToggle={toggleMenu}
            panel={
              <MenuItem
                label="Close Window"
                shortcut="⌘W"
                disabled={!hasWindow}
                onSelect={handleClose}
              />
            }
          >
            File
          </MenuButton>

          <MenuButton
            id="window"
            openMenu={openMenu}
            onToggle={toggleMenu}
            panel={
              <>
                <MenuItem
                  label="Minimize"
                  shortcut="⌘M"
                  disabled={!hasWindow}
                  onSelect={handleMinimize}
                />
                <MenuItem
                  label="Zoom"
                  disabled={!hasWindow}
                  onSelect={handleZoom}
                />
              </>
            }
          >
            Window
          </MenuButton>
        </nav>

        {/* ---------------------------------------------------------------- */}
        {/*  Right — system status cluster                                   */}
        {/* ---------------------------------------------------------------- */}
        <div className="flex items-center gap-1 text-white/80">
          <button
            type="button"
            onClick={openSpotlight}
            aria-label="Spotlight Search"
            className="flex h-os-menubar w-os-menubar items-center justify-center rounded-md transition-colors hover:bg-white/10"
          >
            <Search size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => setMissionControl(true)}
            aria-label="Mission Control"
            title="Mission Control"
            className="flex h-os-menubar w-os-menubar items-center justify-center rounded-md transition-colors hover:bg-white/10"
          >
            <LayoutGrid size={14} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Control Center"
            className="flex h-os-menubar w-os-menubar items-center justify-center rounded-md transition-colors hover:bg-white/10"
          >
            <SlidersHorizontal size={14} strokeWidth={2} />
          </button>
          <Wifi size={15} strokeWidth={2} className="mx-0.5" />
          <BatteryFull size={20} strokeWidth={1.6} className="mx-0.5" />
          <span className="ml-0.5 mr-1.5 text-[13px] tabular-nums tracking-tight text-white/90">
            {clock}
          </span>
        </div>
      </div>
    </>
  )
}
