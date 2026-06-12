# Morris Desktop Interaction Contract

This project is not a normal portfolio page. It is an operating-interface
portfolio built around a macOS-like desktop metaphor: wallpaper, menubar, dock,
windows, Spaces, Spotlight, Mission Control, and app surfaces.

The design standard is therefore not "make a nice component." Every UI change
must first define the interaction model that makes the interface feel alive:
state machine, spatial topology, motion physics, keyboard path, and safety
behavior.

Use this document before building or asking an AI model to build any meaningful
frontend feature in this repo.

## Product Posture

- Purpose: present Morris as a product builder through a working desktop shell,
  not a static resume.
- Tone: precise, kinetic, glassy, technical, and human. The UI should feel like
  an instrument panel that happens to contain a portfolio.
- Stack: Next.js, React, Tailwind CSS, `motion/react`, GSAP where needed,
  Zustand for window system state.
- Design risk: drifting into a decorative macOS clone. The shell should preserve
  familiar OS affordances, but the content and motion should express Morris'
  own product taste.

## Required Pre-Coding Pass

Before implementation, write these five sections for the component or flow:

1. State machine
   - Include visual states, interaction states, async states, and failure states.
   - Name the allowed transitions. If a transition is impossible, say why.

2. Spatial topology
   - Draw an ASCII layout for desktop and narrow viewports when relevant.
   - Define stable regions, overflow behavior, and fixed-size controls.

3. Motion physics
   - Specify spring stiffness, damping, mass, duration, and easing intent.
   - Define hover, press, enter, exit, drag, snap, minimize, and restore behavior.
   - Include reduced-motion behavior.

4. A11y and keyboard path
   - Define roles, labels, focus order, escape path, roving focus if needed,
     and live announcements.

5. Safety and fallback
   - Define empty, loading, error, offline, clipboard failure, destructive
     action, and unavailable-state behavior.

Implementation should only begin after this pre-coding pass exists in the task,
PR, or prompt.

## Shared Motion Tokens

Use these as starting points. Tune only when the interaction has a clear reason.

| Token | Use | Motion |
| --- | --- | --- |
| `spring.window.enter` | Window opening, restore | stiffness 460, damping 34, mass 0.7 |
| `spring.window.drag` | Drag settle, snap to bounds | stiffness 520, damping 38, mass 0.8 |
| `spring.window.fullscreen` | Enter or exit fullscreen Space | stiffness 380, damping 36, mass 0.9 |
| `spring.dock.wave` | Dock magnification wave | stiffness 170, damping 14, mass 0.1 |
| `spring.icon.press` | Icon press or desktop shortcut tap | stiffness 500, damping 32, mass 0.8 |
| `spring.panel.enter` | Spotlight, menus, context panels | stiffness 420, damping 32, mass 0.75 |
| `duration.fast` | Small opacity/color feedback | 120-180ms |
| `duration.medium` | Panel enter/exit | 180-260ms |
| `duration.slow` | Boot, wallpaper, hero atmosphere | 700-1200ms |

Reduced motion:

- Disable wallpaper drift, scanlines, ticker movement, boot scan, and decorative
  infinite animation.
- Replace spring travel with short opacity or color transitions.
- Preserve state feedback. Reduced motion must not mean reduced clarity.

## Core State Machines

### Window Frame

Applies to `src/components/window/window-frame.tsx` and
`src/stores/use-window-store.ts`.

```text
Closed
  -> Launching
  -> WindowedFocused
  -> WindowedUnfocused
  -> Dragging
  -> Resizing
  -> Zoomed
  -> Minimized
  -> FullscreenEntering
  -> FullscreenFocused
  -> FullscreenChromeHidden
  -> FullscreenChromeRevealed
  -> FullscreenExiting
  -> Closing
  -> Closed
```

Rules:

- `Dragging` and `Resizing` are pointer-capture states. They must clean up global
  listeners on pointer up and unmount.
- `Minimized` preserves app state and removes pointer events.
- `FullscreenFocused` lives in a generated fullscreen Space and must not remount
  app content.
- `FullscreenChromeHidden` must always have a top-edge reveal zone.
- `Closing` a fullscreen window dissolves its fullscreen Space and returns to
  the origin desktop.

Spatial topology:

```text
+------------------------------------------------+
| Menubar: fixed 28px                            |
+------------------------------------------------+
|                                                |
|  Desktop work area                             |
|                                                |
|      +-------------------------------+         |
|      | Window titlebar               |         |
|      +-------------------------------+         |
|      | App content                    |         |
|      |                                |         |
|      +-------------------------------+         |
|                                                |
+------------------------------------------------+
| Dock reserve: about 80px                       |
+------------------------------------------------+
```

A11y:

- Traffic lights require clear `aria-label` values.
- Focused window should be visually and programmatically distinguishable.
- Keyboard shortcuts must have an escape path: Escape exits fullscreen first,
  then clears menus or selections.

### Dock

Applies to `src/components/desktop/dock.tsx`.

```text
Idle
  -> Proximity
  -> Hover
  -> Pressed
  -> Launching
  -> Running
  -> Minimized
  -> Restoring

TrashIdle
  -> TrashHover
  -> TrashPressed
  -> CloseAllPending
  -> CloseAllCommitted
```

Rules:

- Magnification is distance-field driven, not a static hover scale.
- The wave pushes adjacent tiles by changing live width and height, preserving
  the lateral dock spread.
- Running indicators animate in and out without shifting tile layout.
- Destructive dock actions like Trash close-all should have explicit feedback.
  A two-step confirm, hold-to-confirm, or reversible undo toast is preferred.

Spatial topology:

```text
                 tooltip
                   |
      +------------------------------------+
      | Finder | apps... | separator | Bin |
      +------------------------------------+
             running dots below icons
```

A11y:

- Each tile is a button with an `aria-label`.
- Tooltip text is supplemental, not the only label.
- Dock must remain usable when motion is reduced.

### Spotlight

Applies to `src/components/desktop/spotlight.tsx`.

```text
Closed
  -> Opening
  -> EmptyQuery
  -> Typing
  -> ResultsAvailable
  -> KeyboardNavigating
  -> MouseHighlighting
  -> NoResults
  -> LaunchingResult
  -> Closing
```

Rules:

- Keyboard navigation owns scroll-into-view. Mouse hover must not steal the
  selected row from a keyboard user.
- Query changes reset the active index.
- Escape closes the panel. Enter opens the selected result.
- Clicking backdrop closes; clicking panel content must not bubble to backdrop.

Spatial topology:

```text
              screen overlay
+----------------------------------------------+
| Backdrop blur                                |
|                                              |
|          +--------------------------+        |
|          | Search input             |        |
|          +--------------------------+        |
|          | Result row               |        |
|          | Result row selected      |        |
|          | Empty state if needed    |        |
|          +--------------------------+        |
|          | keyboard hint footer     |        |
|          +--------------------------+        |
|                                              |
+----------------------------------------------+
```

A11y target:

- Container: `role="dialog"` and `aria-modal="true"`.
- Input: `role="combobox"`, `aria-expanded`, `aria-controls`, and
  `aria-activedescendant`.
- Results list: `role="listbox"`.
- Result rows: `role="option"` and `aria-selected`.
- Result count or empty state should be announced through `aria-live="polite"`.
- Focus returns to the opener where possible.

### Mission Control

Applies to `src/components/desktop/mission-control.tsx`.

```text
Closed
  -> Opening
  -> SpaceOverview
  -> WindowOverview
  -> SpaceHover
  -> WindowHover
  -> SwitchingSpace
  -> SelectingWindow
  -> AddingDesktop
  -> RemovingSpace
  -> Closing
```

Rules:

- Mission Control is a mode, not a modal. It represents the entire desktop
  state while active.
- Spaces bar is horizontally scrollable and never shrinks thumbnails below
  inspection size.
- Window tiles should preserve original window aspect ratio.
- Future improvement: tile position can be derived from original window
  coordinates, creating a true zoomed-out map instead of a centered gallery.

Spatial topology:

```text
+------------------------------------------------+
| Spaces bar                                     |
| [Desktop 1] [Desktop 2] [Fullscreen App] [+]   |
+------------------------------------------------+
|                                                |
|          [Window A]     [Window B]             |
|                [Window C]                      |
|                                                |
+------------------------------------------------+
| keyboard hint                                  |
+------------------------------------------------+
```

A11y:

- Escape and Ctrl+ArrowDown close the mode.
- Ctrl+ArrowLeft and Ctrl+ArrowRight switch desktop Spaces.
- Space thumbnails and window tiles must expose labels.
- Close buttons need labels that distinguish "Close window" from
  "Close desktop".

### Projects App

Applies to `src/components/apps/projects-app.tsx`.

Current layout is a useful sidebar plus list. The target direction is a compact
project control room, not a resume feed.

```text
Idle
  -> FilterHover
  -> FilterSelected
  -> Filtering
  -> ResultsVisible
  -> EmptyFiltered
  -> ProjectHover
  -> ExternalOpening
```

Recommended topology:

```text
+------------------+--------------------------------+
| Filters          | Featured project               |
|                  +---------------+----------------+
|                  | Stack map     | Outcome signal |
+------------------+---------------+----------------+
| Project cards grid                               |
+--------------------------------------------------+
```

Rules:

- Filters should behave like a single-select list or tab set, not loose links.
- Project cards should show outcome before technology when space is tight.
- External links must have labels and visible focus states.
- Empty filtered state should suggest a nearby recovery action.

## App Surface Checklist

Every app inside a window should define:

- App purpose in one sentence.
- Primary object: note, project, contact channel, reel item, terminal command,
  or profile section.
- Primary action and secondary action.
- Loading, empty, error, and narrow-window behavior.
- Whether it scrolls internally, lets the window scroll, or uses a split pane.
- Keyboard path for the most common action.

## AI One-Shot Template

Use this template when asking an AI model to generate or modify frontend code in
this repo.

```markdown
You are working in Morris Portfolio, a Next.js + React + Tailwind + motion/react
desktop-interface portfolio. Do not write UI code until you define the
interaction contract.

Requirement:
"[describe the feature]"

Repo context:
- Desktop shell: macOS-like windows, Dock, Spaces, Spotlight, Mission Control.
- Motion should use `motion/react` and the shared motion intent from
  `docs/design/interaction-contract.md`.
- State that affects windows belongs in `src/stores/use-window-store.ts`.
- Keep app content mounted across Space and fullscreen transitions where possible.

First output:

1. State machine
- List all states.
- List transitions and guards.
- Include loading, empty, error, reduced-motion, and destructive states.

2. Spatial topology
- Draw ASCII layout for desktop and constrained/narrow windows.
- Identify fixed regions, scroll regions, and overflow behavior.

3. Motion physics
- Define spring or timing values for enter, exit, hover, press, drag, snap,
  minimize, restore, and mode switches.
- Define reduced-motion fallback.

4. A11y and keyboard path
- Define roles, labels, focus order, Escape behavior, roving focus if needed,
  and live announcements.

5. Implementation plan
- Name files to edit.
- Explain how existing state and components will be reused.

Only after those five sections, write the code.
```

## Review Gate

A frontend change is not complete until these are true:

- The state machine has no unreachable or dead-end states.
- Every animated state has a non-animated equivalent for reduced motion.
- Keyboard users can enter, operate, and leave the feature.
- Empty, loading, and error states are visible and meaningful.
- Text fits in fixed-size controls at desktop and narrow window sizes.
- New UI follows the desktop metaphor instead of becoming a generic card page.
- Existing user state is preserved across window focus, Space switching,
  minimizing, and fullscreen transitions unless the task explicitly says
  otherwise.

