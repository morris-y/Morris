import { create } from 'zustand'
import { v4 as uuidv4 } from 'uuid'
import type { AppId, AppInstance, Space, WindowConstraints, WindowPosition, WindowSize } from '@/types/window'

const BASE_Z = 100
const CASCADE_OFFSET = 28
const MAX_CASCADES = 5
const INITIAL_POSITION = { x: 100, y: 80 }
const FIRST_SPACE = 'desktop-1'

interface WindowStore {
  instances: Record<string, AppInstance>
  instanceOrder: string[]
  spaces: Space[]
  currentSpaceId: string
  missionControlOpen: boolean

  launchApp: (appId: AppId, constraints: WindowConstraints, title: string) => void
  closeApp: (instanceId: string) => void
  minimizeApp: (instanceId: string) => void
  restoreApp: (instanceId: string) => void
  zoomApp: (instanceId: string) => void
  toggleFullscreen: (instanceId: string) => void
  focusApp: (instanceId: string) => void
  updatePosition: (instanceId: string, position: WindowPosition) => void
  updateSize: (instanceId: string, size: WindowSize) => void
  closeAll: () => void

  // Spaces / Mission Control
  addSpace: () => void
  removeSpace: (spaceId: string) => void
  switchSpace: (spaceId: string) => void
  moveWindowToSpace: (instanceId: string, spaceId: string) => void
  setMissionControl: (open: boolean) => void
}

function recalculateZIndexes(
  instances: Record<string, AppInstance>,
  instanceOrder: string[]
): Record<string, AppInstance> {
  const updated = { ...instances }
  instanceOrder.forEach((id, index) => {
    if (updated[id]) {
      updated[id] = { ...updated[id], zIndex: BASE_Z + index }
    }
  })
  return updated
}

function computeNextPosition(instances: Record<string, AppInstance>): WindowPosition {
  const count = Object.keys(instances).length
  const cascadeIndex = count % MAX_CASCADES
  return {
    x: INITIAL_POSITION.x + cascadeIndex * CASCADE_OFFSET,
    y: INITIAL_POSITION.y + cascadeIndex * CASCADE_OFFSET,
  }
}

function viewport(): { vw: number; vh: number } {
  if (typeof window === 'undefined') return { vw: 1280, vh: 800 }
  return { vw: window.innerWidth, vh: window.innerHeight }
}

function firstDesktopSpaceId(spaces: Space[]): string {
  return spaces.find((s) => s.kind === 'desktop')?.id ?? spaces[0]?.id ?? FIRST_SPACE
}

export const useWindowStore = create<WindowStore>((set, get) => ({
  instances: {},
  instanceOrder: [],
  spaces: [{ id: FIRST_SPACE, kind: 'desktop', name: 'Desktop 1' }],
  currentSpaceId: FIRST_SPACE,
  missionControlOpen: false,

  launchApp: (appId, constraints, title) => {
    const { instances, instanceOrder, spaces, currentSpaceId } = get()

    // Existing instance → switch to its Space, restore + focus it (macOS: clicking
    // a Dock icon jumps to the Space the window already lives in).
    const existingId = Object.values(instances).find((inst) => inst.appId === appId)?.instanceId
    if (existingId) {
      const existing = instances[existingId]
      const newOrder = instanceOrder.filter((id) => id !== existingId).concat(existingId)
      const updated = recalculateZIndexes(
        { ...instances, [existingId]: { ...existing, isMinimized: false } },
        newOrder
      )
      set({
        instances: updated,
        instanceOrder: newOrder,
        currentSpaceId: existing.spaceId,
        missionControlOpen: false,
      })
      return
    }

    // New window → lands in the current desktop Space (or the first desktop Space
    // if we're currently inside a fullscreen Space).
    const current = spaces.find((s) => s.id === currentSpaceId)
    const targetSpaceId =
      current && current.kind === 'desktop' ? currentSpaceId : firstDesktopSpaceId(spaces)

    const instanceId = uuidv4()
    const position = computeNextPosition(instances)
    const newInstance: AppInstance = {
      instanceId,
      appId,
      isMinimized: false,
      isZoomed: false,
      isFullscreen: false,
      spaceId: targetSpaceId,
      position,
      size: constraints.defaultSize,
      title,
      zIndex: BASE_Z + instanceOrder.length,
    }

    const newOrder = [...instanceOrder, instanceId]
    const newInstances = recalculateZIndexes(
      { ...instances, [instanceId]: newInstance },
      newOrder
    )

    set({
      instances: newInstances,
      instanceOrder: newOrder,
      currentSpaceId: targetSpaceId,
      missionControlOpen: false,
    })
  },

  closeApp: (instanceId) => {
    const { instances, instanceOrder, spaces, currentSpaceId } = get()
    const inst = instances[instanceId]
    if (!inst) return

    // Closing a fullscreen window dissolves its Space and returns to the origin.
    let nextSpaces = spaces
    let nextCurrent = currentSpaceId
    if (inst.isFullscreen) {
      nextSpaces = spaces.filter((s) => s.fullscreenInstanceId !== instanceId)
      nextCurrent = inst.preFullscreen?.spaceId ?? firstDesktopSpaceId(nextSpaces)
    }

    const { [instanceId]: _removed, ...remaining } = instances
    const newOrder = instanceOrder.filter((id) => id !== instanceId)
    const updated = recalculateZIndexes(remaining, newOrder)

    if (!nextSpaces.some((s) => s.id === nextCurrent)) {
      nextCurrent = firstDesktopSpaceId(nextSpaces)
    }

    set({
      instances: updated,
      instanceOrder: newOrder,
      spaces: nextSpaces,
      currentSpaceId: nextCurrent,
    })
  },

  minimizeApp: (instanceId) => {
    const { instances, spaces } = get()
    const inst = instances[instanceId]
    if (!inst) return

    // Minimizing a fullscreen window first exits fullscreen onto its origin
    // desktop, then minimizes — so it lands in the Dock instead of trapping the
    // user in a fullscreen Space with no Dock to restore from.
    if (inst.isFullscreen) {
      const pf = inst.preFullscreen
      const remainingSpaces = spaces.filter((s) => s.fullscreenInstanceId !== instanceId)
      const restoreSpace =
        pf?.spaceId && remainingSpaces.some((s) => s.id === pf.spaceId)
          ? pf.spaceId
          : firstDesktopSpaceId(remainingSpaces)
      set({
        instances: {
          ...instances,
          [instanceId]: {
            ...inst,
            isFullscreen: false,
            isMinimized: true,
            spaceId: restoreSpace,
            position: pf?.position ?? inst.position,
            size: pf?.size ?? inst.size,
            preFullscreen: undefined,
          },
        },
        spaces: remainingSpaces,
        currentSpaceId: restoreSpace,
      })
      return
    }

    set({
      instances: {
        ...instances,
        [instanceId]: { ...inst, isMinimized: true },
      },
    })
  },

  restoreApp: (instanceId) => {
    const { instances, instanceOrder } = get()
    const inst = instances[instanceId]
    if (!inst) return
    const newOrder = instanceOrder.filter((id) => id !== instanceId).concat(instanceId)
    const updated = recalculateZIndexes(
      { ...instances, [instanceId]: { ...inst, isMinimized: false } },
      newOrder
    )
    set({ instances: updated, instanceOrder: newOrder, currentSpaceId: inst.spaceId })
  },

  zoomApp: (instanceId) => {
    const { instances } = get()
    const inst = instances[instanceId]
    if (!inst || inst.isFullscreen) return

    // Un-zoom: restore the saved frame
    if (inst.isZoomed && inst.prevFrame) {
      set({
        instances: {
          ...instances,
          [instanceId]: {
            ...inst,
            isZoomed: false,
            position: inst.prevFrame.position,
            size: inst.prevFrame.size,
            prevFrame: undefined,
          },
        },
      })
      return
    }

    // Zoom: fill the work area (below the 28px menubar, above the ~80px dock).
    const MENUBAR = 28
    const DOCK = 80
    const { vw, vh } = viewport()
    set({
      instances: {
        ...instances,
        [instanceId]: {
          ...inst,
          isZoomed: true,
          prevFrame: { position: inst.position, size: inst.size },
          position: { x: 0, y: 0 },
          size: { width: vw, height: Math.max(300, vh - MENUBAR - DOCK) },
        },
      },
    })
  },

  // macOS fullscreen: the window leaves its desktop Space for a brand-new
  // fullscreen Space that fills the whole screen (covering menubar + dock).
  toggleFullscreen: (instanceId) => {
    const { instances, instanceOrder, spaces } = get()
    const inst = instances[instanceId]
    if (!inst) return

    if (inst.isFullscreen) {
      // Exit — restore the pre-fullscreen frame + origin Space, drop the fs Space.
      const pf = inst.preFullscreen
      const remainingSpaces = spaces.filter((s) => s.fullscreenInstanceId !== instanceId)
      const restoreSpace =
        pf?.spaceId && remainingSpaces.some((s) => s.id === pf.spaceId)
          ? pf.spaceId
          : firstDesktopSpaceId(remainingSpaces)
      set({
        instances: {
          ...instances,
          [instanceId]: {
            ...inst,
            isFullscreen: false,
            spaceId: restoreSpace,
            position: pf?.position ?? inst.position,
            size: pf?.size ?? inst.size,
            preFullscreen: undefined,
          },
        },
        spaces: remainingSpaces,
        currentSpaceId: restoreSpace,
        missionControlOpen: false,
      })
      return
    }

    // Enter — create the fullscreen Space and move the window into it.
    const { vw, vh } = viewport()
    const fsId = uuidv4()
    const fsSpace: Space = {
      id: fsId,
      kind: 'fullscreen',
      name: inst.title,
      fullscreenInstanceId: instanceId,
    }
    const newOrder = instanceOrder.filter((id) => id !== instanceId).concat(instanceId)
    const updated = recalculateZIndexes(
      {
        ...instances,
        [instanceId]: {
          ...inst,
          isFullscreen: true,
          isZoomed: false,
          isMinimized: false,
          preFullscreen: { position: inst.position, size: inst.size, spaceId: inst.spaceId },
          spaceId: fsId,
          position: { x: 0, y: 0 },
          size: { width: vw, height: vh },
        },
      },
      newOrder
    )
    set({
      instances: updated,
      instanceOrder: newOrder,
      spaces: [...spaces, fsSpace],
      currentSpaceId: fsId,
      missionControlOpen: false,
    })
  },

  focusApp: (instanceId) => {
    const { instances, instanceOrder } = get()
    if (!instances[instanceId]) return
    const newOrder = instanceOrder.filter((id) => id !== instanceId).concat(instanceId)
    const updated = recalculateZIndexes(instances, newOrder)
    set({ instances: updated, instanceOrder: newOrder })
  },

  updatePosition: (instanceId, position) => {
    const { instances } = get()
    if (!instances[instanceId]) return
    set({
      instances: {
        ...instances,
        [instanceId]: { ...instances[instanceId], position },
      },
    })
  },

  updateSize: (instanceId, size) => {
    const { instances } = get()
    if (!instances[instanceId]) return
    set({
      instances: {
        ...instances,
        [instanceId]: { ...instances[instanceId], size },
      },
    })
  },

  closeAll: () => {
    const { spaces } = get()
    const desktopSpaces = spaces.filter((s) => s.kind === 'desktop')
    const keep: Space[] = desktopSpaces.length
      ? desktopSpaces
      : [{ id: FIRST_SPACE, kind: 'desktop', name: 'Desktop 1' }]
    set({
      instances: {},
      instanceOrder: [],
      spaces: keep,
      currentSpaceId: keep[0].id,
      missionControlOpen: false,
    })
  },

  // ── Spaces / Mission Control ───────────────────────────────────────────────

  addSpace: () => {
    const { spaces } = get()
    const desktopCount = spaces.filter((s) => s.kind === 'desktop').length
    set({
      spaces: [...spaces, { id: uuidv4(), kind: 'desktop', name: `Desktop ${desktopCount + 1}` }],
    })
  },

  removeSpace: (spaceId) => {
    const { spaces, instances, currentSpaceId } = get()
    const space = spaces.find((s) => s.id === spaceId)
    if (!space) return

    // Removing a fullscreen Space = exit fullscreen for its window.
    if (space.kind === 'fullscreen') {
      if (space.fullscreenInstanceId) get().toggleFullscreen(space.fullscreenInstanceId)
      return
    }

    // Keep at least one desktop Space.
    if (spaces.filter((s) => s.kind === 'desktop').length <= 1) return

    const remaining = spaces.filter((s) => s.id !== spaceId)
    const fallback = firstDesktopSpaceId(remaining)
    const moved: Record<string, AppInstance> = {}
    for (const [id, inst] of Object.entries(instances)) {
      moved[id] = inst.spaceId === spaceId ? { ...inst, spaceId: fallback } : inst
    }
    set({
      spaces: remaining,
      instances: moved,
      currentSpaceId: currentSpaceId === spaceId ? fallback : currentSpaceId,
    })
  },

  switchSpace: (spaceId) => {
    const { spaces } = get()
    if (!spaces.some((s) => s.id === spaceId)) return
    set({ currentSpaceId: spaceId, missionControlOpen: false })
  },

  moveWindowToSpace: (instanceId, spaceId) => {
    const { instances, spaces } = get()
    const inst = instances[instanceId]
    const space = spaces.find((s) => s.id === spaceId)
    if (!inst || !space || space.kind !== 'desktop' || inst.isFullscreen) return
    set({
      instances: {
        ...instances,
        [instanceId]: { ...inst, spaceId, isMinimized: false },
      },
    })
  },

  setMissionControl: (open) => set({ missionControlOpen: open }),
}))
