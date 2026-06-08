# Overnight Build Summary — macOS Portfolio Desktop

## What Was Built

### New Files Created

**Desktop / Window System**
- `src/components/desktop/desktop.tsx` — Main desktop orchestrator; window area, desktop shortcuts, keyboard shortcuts (Cmd+W close, Cmd+Space spotlight)
- `src/components/desktop/dock.tsx` — macOS Dock with spring-physics magnification (motion/react), open-app indicator dots
- `src/components/desktop/menubar.tsx` — Top menubar with clock, wifi/battery icons
- `src/components/desktop/wallpaper.tsx` — Animated gradient wallpaper
- `src/components/desktop/boot-screen.tsx` — Boot animation before desktop appears
- `src/components/desktop/spotlight.tsx` — Spotlight search overlay (Cmd+Space)
- `src/components/window/window-frame.tsx` — Draggable, resizable window chrome with 8-direction resize handles
- `src/components/window/window-titlebar.tsx` — macOS traffic-light title bar (close/minimize/zoom)

**App Windows**
- `src/components/apps/notes-app.tsx` — Notes app with sidebar + markdown reader
- `src/components/apps/terminal-app.tsx` — Terminal emulator with boot sequence, typewriter effect, matrix easter egg
- `src/components/apps/about-app.tsx` — About/bio app
- `src/components/apps/contact-app.tsx` — Contact links app
- `src/components/apps/projects-app.tsx` — Projects showcase app
- `src/components/apps/reel-app.tsx` — Coming-soon reel app

**Config / State**
- `src/config/app-registry.tsx` — Registry of all apps with lazy-loaded components and window constraints
- `src/stores/use-window-store.ts` — Zustand v5 store managing window instances, z-order, position, size

**Types**
- `src/types/window.ts` — TypeScript types: `AppId`, `WindowPosition`, `WindowSize`, `AppInstance`, `AppWindowProps`, `AppDefinition`

**Content / Data**
- `src/lib/content.ts` — Site config, projects data, skills (used by terminal + about apps)
- `src/lib/notes.ts` — MDX/markdown note loader for Notes app
- `src/content/notes/` — Markdown notes (PM topics, thoughts)

**Pages**
- `src/app/(site)/page.tsx` — Home page with mode-switcher (desktop / scroll / netflix)
- `src/app/(site)/projects/page.tsx` — Projects page
- `src/app/(site)/reel/page.tsx` — Reel page
- `src/app/(site)/notes/page.tsx` — Notes list page
- `src/app/(nav)/layout.tsx` — Nav layout wrapper

### Modified Files

- `src/components/window/window-frame.tsx` — Fixed stale-closure bug in drag/resize handlers (F1); upgraded shadow to `shadow-black/60`; forwarded `isFocused` to titlebar
- `src/components/window/window-titlebar.tsx` — Added focused/unfocused visual state: dims titlebar bg, desaturates traffic lights to gray when window loses focus
- `src/app/globals.css` — Global styles, scrollbar utilities
- `src/app/layout.tsx` — Root layout with Providers
- `src/components/providers.tsx` — ThemeProvider wrapper

## New Packages Added

| Package | Version | Purpose |
|---|---|---|
| `motion` | v12.40.0 | Animation (import from `motion/react`) |
| `@base-ui/react` | ^1.5.0 | Accessible UI primitives |
| `gsap` | v3 | GSAP animations |
| `@gsap/react` | v3 | GSAP React hooks |
| `zustand` | v5 | Window state management |
| `uuid` | latest | Unique window instance IDs |
| `next-themes` | latest | Light/dark theme |
| `react-markdown` | latest | Markdown rendering in Notes |
| `remark-gfm` | latest | GitHub Flavored Markdown |
| `tw-animate-css` | latest | Tailwind animation utilities |

## How to Run

```bash
npm run dev
```

Open http://localhost:3000 — a boot screen plays, then the macOS desktop appears.

## Key Features Implemented

- **macOS Desktop Environment**: Full window manager with drag, resize (8 directions), focus, minimize, z-order stacking
- **Dock Magnification**: Spring-physics proximity scaling (1x to 1.6x) based on mouse distance, with open-app indicator dots
- **Traffic Light Controls**: Focused state shows colored dots (red/yellow/green); unfocused state desaturates to uniform gray — matches real macOS behavior
- **Terminal Emulator**: Boot sequence with typewriter effect, `help/about/projects/contact/skills/clear/matrix` commands, command history, blinking cursor
- **Notes App**: MDX-powered notes with sidebar navigation and markdown renderer
- **Spotlight Search**: Cmd+Space overlay to search and launch apps
- **Three-Mode Portfolio Switcher**: Toggle between macOS desktop / scroll / Netflix browse modes
- **Window Shadow**: `shadow-2xl shadow-black/60` on all windows for depth
- **Stale-Closure Fix**: Drag and resize window listeners use stable refs (via `useRef` delegation pattern) so handlers never go stale after re-renders

## Known Issues / TODOs for Next Iteration

- **Window minimize animation**: Currently windows just disappear (no Genie effect into Dock)
- **Dock minimize restore**: Minimized windows are not shown in the Dock as individual icons; they restore via clicking the app icon
- **Maximize/fullscreen**: Green traffic light button is wired but does nothing (no fullscreen logic yet)
- **Notes app**: MDX rendering works but no syntax highlighting in code blocks
- **Reel app**: "Coming soon" placeholder — needs actual video/reel content
- **Mobile responsiveness**: Desktop mode is not touch/mobile optimized (intentional for desktop-first)
- **Wallpaper variety**: Single gradient wallpaper; could add wallpaper picker
- **Netflix mode**: Implemented as a mode switcher; individual project cards could be richer
- **Boot screen**: Currently a simple animation; could show more realistic macOS boot progress
