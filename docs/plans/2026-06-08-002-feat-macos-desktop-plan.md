---
title: "feat: macOS web desktop shell for portfolio"
type: feat
status: active
date: 2026-06-08
---

# feat: macOS Web Desktop Shell for Portfolio

## Summary

Replace the three-card mode-switcher landing page (`/`) with a ryos-inspired macOS web desktop. The desktop renders a persistent Dock, a menu bar, draggable/resizable window chrome, and six app windows (Notes, Projects/Netflix, Terminal, About, Contact, Reel). All existing page content is reused inside windows with minor prop adaptations. A GSAP boot sequence plays on first load. Spotlight search opens apps by keyboard shortcut.

---

## Problem Frame

Phase 1 shipped a three-card mode-switcher (`/`) that lets visitors choose Notes, Projects, or Reel. This was always a placeholder architecture. Phase 2 replaces it with a full macOS desktop shell: every app lives in a windowed container, the Dock replaces the card grid, and the overall feel shifts from a static landing page to an interactive OS environment.

Existing route pages (`/notes`, `/projects`, `/reel`, `/about`, `/contact`, `/experience`) remain briefly for graceful redirect handling, then all redirect to `/` where the desktop shell manages state. No new URL changes happen when opening or switching windows.

---

## Key Technical Decisions

### State — Zustand v5
Each open window is tracked in a global Zustand store. Window record shape:

```ts
type WindowInstance = {
  instanceId: string      // uuid
  appId: AppId
  position: { x: number; y: number }
  size: { width: number; height: number }
  zIndex: number
  isMinimized: boolean
  isFocused: boolean
}
```

Store actions: `openApp`, `closeApp`, `focusWindow`, `moveWindow`, `resizeWindow`, `minimizeWindow`, `restoreWindow`. A `nextZIndex` counter increments on every focus to keep ordering correct without reordering the array.

### Animations — motion/react
Window lifecycle animations use `motion/react` (`AnimatePresence` + `motion.div`):
- **Open**: scale from 0.85 + fade in, transform-origin set to the Dock icon's bounding rect (origin-point animation).
- **Close**: scale to 0.85 + fade out to same origin point.
- **Minimize**: translate-y to Dock position + scale to 0 (genie-like).
- **Restore**: reverse of minimize.

All durations 180–280 ms, `ease: [0.25, 0.46, 0.45, 0.94]` (iOS-like spring).

### Boot Sequence — GSAP + @gsap/react
GSAP handles the one-time boot sequence because it excels at tightly sequenced multi-element timelines that are hard to express with declarative motion variants:
1. Black screen with Apple logo fade-in (0–0.8 s).
2. Progress bar fills (0.8–2.2 s).
3. Screen flash / dissolve to desktop wallpaper (2.2–2.6 s).
4. Dock slides up from bottom (2.6–3.0 s).
5. Menu bar slides down (2.6–3.0 s, staggered 80 ms).
6. "Welcome" Finder window opens with spring (3.0–3.4 s).

Boot sequence shown only once per session (`sessionStorage` flag). Subsequent hard-reloads skip to desktop in ~300 ms.

### Drag — Custom Pointer Events (not Framer Motion drag)
Framer Motion's `drag` prop fights with `zIndex` management (it captures the element in a transform layer). Instead, window drag is implemented with raw pointer events:

```ts
onPointerDown(e) -> capture pointer -> track pointermove delta -> update position in Zustand -> releasePointerCapture on pointerup
```

This gives complete control over z-order and works correctly when windows overlap. Window title bar is the drag handle; double-click title bar maximizes/restores.

### Routing — Single-Page, Old Routes Redirect
`/` renders the desktop shell. All existing route group pages (`(nav)`, `(site)`) gain a single-line redirect to `/`. No `next/router` push on window open/close. Deep-linking per window is deferred.

### App Registry
A central registry maps `AppId` to metadata and a lazy-loaded component:

```ts
const APP_REGISTRY: Record<AppId, AppDef> = {
  notes:    { label: 'Notes',    icon: '/icons/notes.png',    defaultSize: { w: 860, h: 580 }, component: React.lazy(() => import('@/apps/NotesApp')) },
  projects: { label: 'Projects', icon: '/icons/projects.png', defaultSize: { w: 960, h: 620 }, component: React.lazy(() => import('@/apps/ProjectsApp')) },
  terminal: { label: 'Terminal', icon: '/icons/terminal.png', defaultSize: { w: 700, h: 460 }, component: React.lazy(() => import('@/apps/TerminalApp')) },
  about:    { label: 'About',    icon: '/icons/about.png',    defaultSize: { w: 640, h: 500 }, component: React.lazy(() => import('@/apps/AboutApp')) },
  contact:  { label: 'Contact',  icon: '/icons/contact.png',  defaultSize: { w: 560, h: 440 }, component: React.lazy(() => import('@/apps/ContactApp')) },
  reel:     { label: 'Reel',     icon: '/icons/reel.png',     defaultSize: { w: 900, h: 560 }, component: React.lazy(() => import('@/apps/ReelApp')) },
}
```

`openApp` checks if an instance already exists; if so, focuses it instead of opening a duplicate (single-instance apps).

### NotesLayout — isWindowed Prop
`NotesLayout` currently uses `h-screen`. In windowed mode it must fill its container instead. Add an `isWindowed?: boolean` prop:

```tsx
// Before
<div className="flex h-screen bg-[#1e1e1e] overflow-hidden">

// After
<div className={cn('flex bg-[#1e1e1e] overflow-hidden', isWindowed ? 'h-full' : 'h-screen')}>
```

The `ArrowLeft / home` link is also hidden when `isWindowed` is true (the window chrome close button replaces it).

### NetflixHeader — Scroll Container Ref
`NetflixHeader` currently listens to `window.scrollY`. Inside a windowed container, the window element scrolls, not `window`. Adapt by accepting an optional `scrollRef: RefObject<HTMLElement>`:

```tsx
// Before
window.addEventListener('scroll', onScroll)

// After
const target = scrollRef?.current ?? window
target.addEventListener('scroll', onScroll, { passive: true })
```

The Projects app window passes its inner scroll container ref down to `NetflixHeader`. The standalone `/projects` route (if kept temporarily) passes no ref (falls back to `window`).

---

## Implementation Units

### Phase 1 — Foundation
1. **Install dependencies**: `zustand@^5`, `gsap`, `@gsap/react`. Confirm `motion` (already installed at ^12).
2. **Window store** (`src/store/windows.ts`): Zustand store with full CRUD actions and `nextZIndex` counter.
3. **App registry** (`src/apps/registry.ts`): `APP_REGISTRY` constant with all six apps, lazy component imports stubbed.
4. **Types** (`src/types/desktop.ts`): `AppId`, `WindowInstance`, `AppDef` TypeScript types.

### Phase 2 — Window Chrome
5. **WindowFrame** (`src/components/desktop/WindowFrame.tsx`): Renders title bar (traffic lights, app title), content slot, resize handle (bottom-right corner). Subscribes to store for this `instanceId`. Pointer-event drag on title bar. `motion.div` wrapping for open/close animations.
6. **WindowManager** (`src/components/desktop/WindowManager.tsx`): Maps `windows` array from store, renders `<WindowFrame>` per instance inside an `<AnimatePresence>`. Positioned `fixed inset-0 pointer-events-none` with each frame having `pointer-events-auto`.
7. **TrafficLights** (`src/components/desktop/TrafficLights.tsx`): Red/yellow/green circles. Red = close, yellow = minimize, green = maximize/restore. Hover reveals symbols.

### Phase 3 — Desktop Shell
8. **Wallpaper** (`src/components/desktop/Wallpaper.tsx`): Full-viewport background. Start with a static dark gradient; optionally accept a wallpaper URL prop.
9. **MenuBar** (`src/components/desktop/MenuBar.tsx`): Fixed top bar. Left side: Apple logo + focused app name + placeholder menus. Right side: clock (live, updates every minute), Wi-Fi/battery icons (static decorative).
10. **Dock** (`src/components/desktop/Dock.tsx`): Fixed bottom bar. Maps `APP_REGISTRY` to icons. Click = `openApp`. Magnification on hover (CSS `transform: scale()` driven by mouse proximity via `onMouseMove`). Running indicator dot for open apps. Minimized window thumbnails slot (deferred — show dot only for now).
11. **BootSequence** (`src/components/desktop/BootSequence.tsx`): GSAP timeline, `sessionStorage` guard. Calls `onComplete` prop when done to unmount itself and reveal desktop.
12. **Desktop** (`src/components/desktop/Desktop.tsx`): Composes Wallpaper + MenuBar + Dock + WindowManager + BootSequence + Spotlight. This is the single root component rendered by `src/app/(site)/page.tsx`.
13. **Update `/` page**: Replace hero/mode-switcher content with `<Desktop />`. Remove old `(site)/page.tsx` hero imports.

### Phase 4 — App Windows
14. **NotesApp** (`src/apps/NotesApp.tsx`): Thin wrapper — fetches `folders` (same logic as current `/notes` page) and renders `<NotesLayout isWindowed folders={folders} />`. Update `NotesLayout` with `isWindowed` prop.
15. **ProjectsApp** (`src/apps/ProjectsApp.tsx`): Renders the Netflix-style projects view. Creates an inner scroll container ref, passes it to `<NetflixHeader scrollRef={...} />`. Update `NetflixHeader` to accept `scrollRef`.
16. **TerminalApp** (`src/apps/TerminalApp.tsx`): Fake interactive terminal. Accepts typed commands (`help`, `about`, `ls projects`, `open notes`, `clear`). `open <appId>` calls `openApp` from store. Monospace font, green-on-black aesthetic.
17. **AboutApp** (`src/apps/AboutApp.tsx`): Renders existing about page content (`src/components/about/` region) without the nav header. Scrollable.
18. **ContactApp** (`src/apps/ContactApp.tsx`): Renders existing contact form content. Compact layout to fit default window size.
19. **ReelApp** (`src/apps/ReelApp.tsx`): Renders existing reel page content (video/embed). Full-bleed inside window.
20. **Redirect old routes**: Each existing page file in `(nav)/` and `(site)/` adds `redirect('/')` at the top (Next.js `import { redirect } from 'next/navigation'`).

### Phase 5 — Polish
21. **Spotlight** (`src/components/desktop/Spotlight.tsx`): `Cmd+Space` opens a centered search input. Filters `APP_REGISTRY` by label. Arrow keys + Enter to open. `Escape` closes. `motion/react` scale/opacity animation.
22. **Dock magnification**: Refine proximity-based magnification with smoother falloff (Gaussian curve on distance from cursor to icon center).
23. **Window open origin**: Calculate Dock icon bounding rect at `openApp` time, store as `originPoint` in window record, pass to `WindowFrame` as `transformOrigin` for the entry animation.
24. **Minimize genie**: Animate minimized window to Dock position with a vertical skew + scale-to-zero sequence using GSAP (single shot, not a loop).
25. **Wallpaper variety**: Add 2–3 wallpaper options accessible from a right-click context menu on the desktop (store selection in `localStorage`).
26. **Focus ring / active window**: Focused window gets a subtle `box-shadow: 0 0 0 1px rgba(255,255,255,0.12), 0 32px 64px rgba(0,0,0,0.6)`. Unfocused windows drop to `rgba(0,0,0,0.3)`.

---

## Scope

| Feature | In Scope |
|---|---|
| 6 app windows | Notes, Projects, Terminal, About, Contact, Reel |
| Dock with magnification | Yes |
| Menu bar with clock | Yes |
| Boot sequence (GSAP) | Yes |
| Spotlight search | Yes |
| Window drag (pointer events) | Yes |
| Window resize (bottom-right handle) | Yes |
| Minimize / restore | Yes |
| Single-page architecture | Yes |
| Old routes redirect to `/` | Yes |
| App registry + React.lazy | Yes |
| NotesLayout `isWindowed` prop | Yes |
| NetflixHeader `scrollRef` prop | Yes |

---

## Deferred

- **TikTok full content window**: TikTok embed/feed app is deferred; Dock icon present but disabled or opens a "coming soon" placeholder.
- **Mobile responsiveness**: macOS desktop UX is inherently pointer-driven. Mobile gets a fallback layout (Dock becomes a tab bar, windows become full-screen sheets). Deferred to a separate plan.
- **URL deep-linking per window**: Opening `/notes` in a new tab does not restore the Notes window. All routes redirect to `/`. Per-window URL state (e.g. `?app=notes`) is deferred.
- **Window resize from all edges**: Only bottom-right corner resize handle in scope. Full-edge + corner resize is deferred.
- **Multi-instance apps**: All apps are single-instance (focus existing window on re-open). True multi-instance is deferred.
- **iCloud / file system simulation**: Terminal app commands are hardcoded; no real FS simulation.
- **Notification center**: Deferred.

---

## File Map (new files)

```
src/
  store/
    windows.ts                      # Zustand window store
  types/
    desktop.ts                      # AppId, WindowInstance, AppDef
  apps/
    registry.ts                     # APP_REGISTRY constant
    NotesApp.tsx
    ProjectsApp.tsx
    TerminalApp.tsx
    AboutApp.tsx
    ContactApp.tsx
    ReelApp.tsx
  components/
    desktop/
      Desktop.tsx                   # Root desktop component
      WindowManager.tsx
      WindowFrame.tsx
      TrafficLights.tsx
      MenuBar.tsx
      Dock.tsx
      Wallpaper.tsx
      BootSequence.tsx
      Spotlight.tsx
```

Existing files modified:
- `src/components/notes/notes-layout.tsx` — add `isWindowed` prop
- `src/components/netflix/netflix-header.tsx` — add `scrollRef` prop
- `src/app/(site)/page.tsx` — replace hero with `<Desktop />`
- `src/app/(nav)/about/page.tsx` — add redirect
- `src/app/(nav)/contact/page.tsx` — add redirect
- `src/app/(nav)/experience/page.tsx` — add redirect
- `src/app/(site)/notes/page.tsx` — add redirect
- `src/app/(site)/projects/page.tsx` — add redirect
- `src/app/(site)/reel/page.tsx` — add redirect
- `package.json` — add `zustand`, `gsap`, `@gsap/react`
