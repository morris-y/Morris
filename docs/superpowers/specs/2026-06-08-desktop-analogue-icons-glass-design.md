# Desktop — Analogue Icons + Glass Windows

Date: 2026-06-08

## Problem

Three issues with the macOS-style desktop:

1. **Apps fail to open** — Turbopack chunk loading error for `terminal-app.tsx` and all other app chunks. Likely stale `.next` cache after recent merges.
2. **Icons look generic/missing** — current Lucide glyph + gradient squircle works structurally but lacks personality.
3. **No glass effect on windows** — window content area uses solid `bg-[#1c1c1e]`, glass CSS classes exist but are not applied.

---

## Solution

### 1. Fix chunk loading

Clear `.next` cache and restart dev server. If error persists after clean restart, investigate module-level errors in app files.

### 2. Analogue Icons — A+C Combo

Each app gets a **physical material background** (Style A) + **clean geometric/typographic symbol** (Style C). No emoji. All icons share a consistent top-left light source.

| App | Material | Symbol |
|---|---|---|
| Notes | Cork board — warm brown with dot-grain texture | White lined notepad (ruled lines via CSS repeating-gradient) |
| Terminal | Brushed dark aluminum — vertical repeating-gradient strips | Green `$_` monospace text with glow |
| Projects | Dark woven film plastic — subtle grid texture + warm edge highlight | White clapperboard (solid rectangle + striped top bar) |
| About | Polished glass sphere — radial blue gradient + specular oval highlight | White `M` monogram, bold |
| Contact | Green felt — diagonal weave texture | White geometric envelope (rectangle + triangle flap via clip-path) |
| Reel | Vinyl record — conic-gradient radial stripes + purple-pink | White wave symbol `∿` |

**Implementation**: Pure CSS inside the `AppIcon` component. Each app in `app-registry.tsx` gets a custom `renderIcon` function (or icon config object) that replaces the generic `Glyph` approach. The squircle shape, `app-icon-squircle` CSS class, and box-shadow system stay unchanged.

**Icon config shape** (added to `AppDefinition`):
```ts
iconStyle: {
  background: string        // CSS background value (gradient / repeating-gradient)
  texture?: string          // optional overlay CSS background (grain, lines, weave)
  symbol: React.ReactNode   // the geometric/text element centered on the icon
  glowColor?: string        // optional glow for luminous symbols (Terminal green)
}
```

### 3. Window Glass Effect — Subtle (Option B)

Apply frosted glass to the window chrome while keeping app content areas readable.

**What changes in `window-frame.tsx`**:
- Add `glass-window` CSS class to the outer `motion.div` (provides semi-transparent background + backdrop-filter)
- Remove the hardcoded `border` class from outer div (glass CSS handles borders)
- Keep `bg-[#1c1c1e]` on the content `div` — app content stays solid dark for readability

**New CSS class** (`globals.css`):
```css
.glass-window {
  background: rgba(28, 28, 36, 0.78);
  backdrop-filter: blur(28px) saturate(160%);
  -webkit-backdrop-filter: blur(28px) saturate(160%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.10),
    0 24px 60px rgba(0, 0, 0, 0.55),
    0 8px 20px rgba(0, 0, 0, 0.40);
}
```

The titlebar already has `glass-titlebar` / `glass-titlebar-unfocused`. This change makes the window frame itself (border, outer glow) feel like frosted glass without making content illegible.

---

## Files Changed

| File | Change |
|---|---|
| `src/config/app-registry.tsx` | Add `iconStyle` to each app definition; add `AnalogueIcon` component |
| `src/components/desktop/app-icon.tsx` | Render `iconStyle.symbol` + texture overlay instead of `Glyph` |
| `src/components/window/window-frame.tsx` | Add `glass-window` class to outer div, remove standalone `border` |
| `src/app/globals.css` | Add `.glass-window` utility class |
| `.next/` | Delete to fix chunk loading (not a code change) |

---

## Out of Scope

- Changing app content layouts (Terminal, Notes, etc.)
- Dock layout changes
- Spotlight changes
- Animated icon effects
