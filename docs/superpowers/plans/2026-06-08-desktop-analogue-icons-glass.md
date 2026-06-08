# Desktop Analogue Icons + Glass Windows Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix chunk loading, add analogue A+C style icons for all 6 apps, and apply frosted-glass effect to window frames.

**Architecture:** Three independent changes — (1) clear stale Turbopack cache to unblock app launches, (2) extend the `AppDefinition` type with an optional `iconConfig` field and update `AppIcon` to render analogue material+symbol icons, (3) add a `.glass-window` CSS class and apply it to `WindowFrame`.

**Tech Stack:** Next.js 15 + Turbopack, React, TypeScript, Tailwind CSS, inline CSS backgrounds (radial-gradient, repeating-linear-gradient, repeating-conic-gradient)

---

## File Map

| File | Change |
|---|---|
| `.next/` | Delete — clears stale Turbopack chunk cache |
| `src/app/globals.css` | Add `.glass-window` class after `.window-shadow-unfocused` |
| `src/components/window/window-frame.tsx` | Add `glass-window` class to outer `motion.div`; remove `border` class; remove inline `borderColor` style |
| `src/types/window.ts` | Add `AnalogueIconConfig` interface; add optional `iconConfig` field to `AppDefinition` |
| `src/components/desktop/app-icon.tsx` | Expand `Pick` to include `iconConfig`; render `iconConfig.symbol(size)` when present |
| `src/config/app-registry.tsx` | Add `iconConfig` to Notes, Projects, Terminal, About, Contact, Reel |

---

## Task 1: Clear Stale Turbopack Cache

**Files:**
- Delete: `.next/`

- [ ] **Step 1: Remove stale build artifacts**

```bash
rm -rf /Users/morrisy/Projects/Morris/.next
```

Expected: command exits silently with no errors.

- [ ] **Step 2: Commit (nothing to commit — this is a generated dir)**

No git commit needed. `.next/` is gitignored.

---

## Task 2: Add `.glass-window` CSS Class

**Files:**
- Modify: `src/app/globals.css` (after line ~390, after `.window-shadow-unfocused`)

- [ ] **Step 1: Add the class**

In `src/app/globals.css`, find the line:

```css
.window-shadow-unfocused {
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.09),
    0 0 0 0.5px rgba(255, 255, 255, 0.07),
    0 14px 36px rgba(0, 0, 0, 0.46);
}
```

Add the following **after** the closing `}`:

```css

/* ── Window frame glass — subtle frosted dark panel ────────────────────── */
.glass-window {
  background: rgba(28, 28, 36, 0.78);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
}
```

> Note: `.glass-window` supplies only the background/blur. The border and shadow are handled by the existing `window-shadow-focused` / `window-shadow-unfocused` classes and the inline `borderColor` style on the motion.div — those stay unchanged.

- [ ] **Step 2: Commit**

```bash
git add src/app/globals.css
git commit -m "feat: add glass-window CSS class for frosted window frames"
```

---

## Task 3: Apply Glass Effect to Window Frame

**Files:**
- Modify: `src/components/window/window-frame.tsx` (line ~273)

- [ ] **Step 1: Update className on the outer motion.div**

Find this code (around line 273):

```tsx
      className={cn(
        'flex flex-col rounded-[14px] overflow-hidden border transition-[box-shadow,border-color] duration-200',
        isFocused ? 'window-shadow-focused' : 'window-shadow-unfocused'
      )}
```

Replace with:

```tsx
      className={cn(
        'flex flex-col rounded-[14px] overflow-hidden glass-window transition-[box-shadow,border-color] duration-200',
        isFocused ? 'window-shadow-focused' : 'window-shadow-unfocused'
      )}
```

> `border` is removed — `.glass-window` does not add a border (the shadow classes provide the 0.5px outer ring). The `borderColor` inline style on the motion.div stays so the focused/unfocused border color still works via the shadow's ring.

- [ ] **Step 2: Start dev server and verify visually**

```bash
cd /Users/morrisy/Projects/Morris && npm run dev
```

Open http://localhost:3000. Click any app icon. The window frame should show a subtle frosted glass background (semi-transparent dark, wallpaper slightly visible through the edges/titlebar area). App content area stays solid dark (`bg-[#1c1c1e]`).

- [ ] **Step 3: Commit**

```bash
git add src/components/window/window-frame.tsx
git commit -m "feat: apply glass-window frosted glass effect to window frames"
```

---

## Task 4: Add AnalogueIconConfig Type

**Files:**
- Modify: `src/types/window.ts`

- [ ] **Step 1: Add interface and optional field**

In `src/types/window.ts`, the current content is:

```ts
import type React from 'react'
import type { LucideIcon } from 'lucide-react'

export type AppId = 'notes' | 'projects' | 'netflix' | 'terminal' | 'about' | 'contact' | 'reel'
```

After the imports and before `AppId`, add:

```ts
export interface AnalogueIconConfig {
  /** CSS background value for the squircle base (radial-gradient, etc.) */
  background: string
  /** Optional CSS background overlay — grain, lines, weave. Layered on top of `background`. */
  texture?: string
  /** Symbol rendered centered on the icon. Receives icon pixel size for scaling. */
  symbol: (size: number) => React.ReactNode
  /** Optional glow color for luminous symbols (Terminal green `$_`). */
  glowColor?: string
}
```

Then in `AppDefinition`, add the optional field after `Glyph`:

```ts
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/morrisy/Projects/Morris && npx tsc --noEmit
```

Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/types/window.ts
git commit -m "feat: add AnalogueIconConfig type and iconConfig field to AppDefinition"
```

---

## Task 5: Update AppIcon to Render Analogue Icons

**Files:**
- Modify: `src/components/desktop/app-icon.tsx`

- [ ] **Step 1: Replace the component**

Replace the entire file content with:

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
cd /Users/morrisy/Projects/Morris && npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 3: Commit**

```bash
git add src/components/desktop/app-icon.tsx
git commit -m "feat: update AppIcon to render analogue material+symbol icons"
```

---

## Task 6: Add iconConfig to All Six Apps

**Files:**
- Modify: `src/config/app-registry.tsx`

### Notes — Cork Board + Lined Notepad

- [ ] **Step 1: Add iconConfig to the Notes entry**

In `src/config/app-registry.tsx`, find the `notes` entry. After the `Glyph: NotebookPen,` line, add:

```tsx
    iconConfig: {
      background: 'radial-gradient(ellipse at 36% 28%, #C4976A 0%, #9A7040 50%, #6A4820 100%)',
      texture:
        'repeating-radial-gradient(circle at 20% 30%, rgba(0,0,0,0.12) 0px, transparent 2px, transparent 7px), ' +
        'repeating-radial-gradient(circle at 65% 58%, rgba(0,0,0,0.10) 0px, transparent 1.5px, transparent 6px)',
      symbol: (s) => (
        <svg width={Math.round(s * 0.46)} height={Math.round(s * 0.46)} viewBox="0 0 22 22" fill="none">
          <rect x="2" y="1" width="18" height="20" rx="1.5" fill="rgba(255,255,255,0.92)" />
          <line x1="5" y1="7" x2="17" y2="7" stroke="rgba(160,110,60,0.55)" strokeWidth="1.1" />
          <line x1="5" y1="11" x2="17" y2="11" stroke="rgba(160,110,60,0.55)" strokeWidth="1.1" />
          <line x1="5" y1="15" x2="13" y2="15" stroke="rgba(160,110,60,0.55)" strokeWidth="1.1" />
        </svg>
      ),
    },
```

### Terminal — Brushed Aluminum + Green `$_`

- [ ] **Step 2: Add iconConfig to the Terminal entry**

Find the `terminal` entry. After `Glyph: SquareTerminal,`, add:

```tsx
    iconConfig: {
      background: 'radial-gradient(ellipse at 40% 30%, #3A4A5A 0%, #1C2530 52%, #0A1018 100%)',
      texture:
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.035) 0px, rgba(255,255,255,0.035) 1px, transparent 1px, transparent 3px)',
      symbol: (s) => (
        <span
          style={{
            fontFamily: '"SF Mono", "Fira Code", "Fira Mono", monospace',
            fontSize: `${Math.round(s * 0.27)}px`,
            fontWeight: 700,
            color: '#30D158',
            letterSpacing: '-0.04em',
          }}
        >
          $_
        </span>
      ),
      glowColor: 'rgba(48, 209, 88, 0.75)',
    },
```

### Projects — Dark Film Plastic + Clapperboard

- [ ] **Step 3: Add iconConfig to the Projects entry**

Find the `projects` entry. After `Glyph: Film,`, add:

```tsx
    iconConfig: {
      background: 'radial-gradient(ellipse at 40% 28%, #2A2435 0%, #0E0C14 52%, #050308 100%)',
      texture:
        'repeating-linear-gradient(90deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px), ' +
        'repeating-linear-gradient(0deg, rgba(255,255,255,0.025) 0px, rgba(255,255,255,0.025) 1px, transparent 1px, transparent 4px)',
      symbol: (s) => {
        const w = Math.round(s * 0.46)
        const h = Math.round(s * 0.42)
        return (
          <svg width={w} height={h} viewBox="0 0 22 20" fill="none">
            <rect x="1" y="7" width="20" height="12" rx="1.5" fill="rgba(255,255,255,0.90)" />
            <rect x="1" y="1" width="20" height="7" rx="1" fill="rgba(255,255,255,0.90)" />
            <path d="M5 1 L2 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M9 1 L6 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M13 1 L10 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17 1 L14 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M21 1 L18 8" stroke="rgba(20,20,30,0.75)" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        )
      },
    },
```

### About — Glass Sphere + M Monogram

- [ ] **Step 4: Add iconConfig to the About entry**

Find the `about` entry. After `Glyph: Fingerprint,`, add:

```tsx
    iconConfig: {
      background: 'radial-gradient(ellipse at 38% 28%, #88BBFF 0%, #2060CC 45%, #0C1E80 100%)',
      texture:
        'radial-gradient(ellipse at 30% 25%, rgba(255,255,255,0.42) 0%, rgba(255,255,255,0.0) 55%)',
      symbol: (s) => (
        <span
          style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif',
            fontSize: `${Math.round(s * 0.44)}px`,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.95)',
            letterSpacing: '-0.02em',
            textShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        >
          M
        </span>
      ),
    },
```

### Contact — Green Felt + Geometric Envelope

- [ ] **Step 5: Add iconConfig to the Contact entry**

Find the `contact` entry. After `Glyph: AtSign,`, add:

```tsx
    iconConfig: {
      background: 'radial-gradient(ellipse at 38% 30%, #2E8A3C 0%, #1B5624 52%, #0C2E12 100%)',
      texture:
        'repeating-linear-gradient(45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px), ' +
        'repeating-linear-gradient(-45deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 1px, transparent 4px)',
      symbol: (s) => {
        const w = Math.round(s * 0.46)
        const h = Math.round(s * 0.38)
        return (
          <svg width={w} height={h} viewBox="0 0 22 18" fill="none">
            <rect x="1" y="3" width="20" height="14" rx="1.5" fill="rgba(255,255,255,0.92)" />
            <path d="M1 3 L11 10 L21 3" stroke="rgba(20,90,30,0.6)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
          </svg>
        )
      },
    },
```

### Reel — Vinyl Record + Sine Wave

- [ ] **Step 6: Add iconConfig to the Reel entry**

Find the `reel` entry. After `Glyph: Smartphone,`, add:

```tsx
    iconConfig: {
      background: 'radial-gradient(ellipse at 42% 30%, #E060C8 0%, #9020A8 45%, #3C086C 100%)',
      texture:
        'repeating-conic-gradient(rgba(255,255,255,0.06) 0deg 15deg, transparent 15deg 30deg), ' +
        'radial-gradient(circle at 50% 50%, rgba(210,190,230,0.22) 0%, rgba(210,190,230,0.22) 8%, transparent 8.5%)',
      symbol: (s) => {
        const w = Math.round(s * 0.46)
        const h = Math.round(s * 0.32)
        return (
          <svg width={w} height={h} viewBox="0 0 22 14" fill="none">
            <path
              d="M1 7 C3 3, 5 3, 7 7 C9 11, 11 11, 13 7 C15 3, 17 3, 19 7 C20 9, 21 9, 21 7"
              stroke="rgba(255,255,255,0.92)"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      },
    },
```

### Final verification

- [ ] **Step 7: TypeScript check**

```bash
cd /Users/morrisy/Projects/Morris && npx tsc --noEmit
```

Expected: no output.

- [ ] **Step 8: Start dev server and verify visually**

```bash
cd /Users/morrisy/Projects/Morris && npm run dev
```

Open http://localhost:3000. Check the Dock and verify:
- Notes: warm cork-tan background with dot grain, white notepad with ruled lines
- Terminal: dark brushed-metal gray with green `$_` and glow
- Projects: near-black with grid texture, white clapperboard
- About: deep blue with specular highlight (glass sphere feel), white `M`
- Contact: deep green with diagonal weave, white envelope
- Reel: purple-pink with vinyl stripes + center dot, white sine wave

Click each app to confirm they open (no chunk loading errors).

- [ ] **Step 9: Commit**

```bash
git add src/config/app-registry.tsx
git commit -m "feat: add analogue A+C material+symbol icons for all six apps"
```

---

## Final Commit

After all tasks complete:

```bash
git log --oneline -6
```

Expected: 5 commits since the previous state — glass CSS, window frame, type update, AppIcon update, registry update.
