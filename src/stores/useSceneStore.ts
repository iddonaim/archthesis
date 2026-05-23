import { create } from 'zustand'
import type { ElementId, Scene, SceneElement } from '@/types/scene'
import { emptyScene } from '@/types/scene'

const HISTORY_LIMIT = 50

interface SceneStore {
  scene: Scene

  // History
  past: Scene[]
  future: Scene[]

  // Mutations (record history unless inside a transaction)
  addElement: (element: Omit<SceneElement, 'id'>) => ElementId
  updateElement: (id: ElementId, updates: Partial<SceneElement>) => void
  deleteElement: (id: ElementId) => void
  /** Move an element to a new z-order index. 0 = bottom. */
  reorderElement: (id: ElementId, toIndex: number) => void

  // Selection (never recorded in history)
  select: (ids: ElementId[]) => void
  selectOne: (id: ElementId | null) => void
  clearSelection: () => void

  // Transactions: coalesce continuous edits (drag, resize) into one entry
  beginTransaction: () => void
  commitTransaction: () => void
  abortTransaction: () => void

  // History
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean

  reset: () => void
}

const generateId = (type: SceneElement['type']) =>
  `${type}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

const pushHistory = (past: Scene[], snapshot: Scene): Scene[] => {
  const next = [...past, snapshot]
  return next.length > HISTORY_LIMIT ? next.slice(next.length - HISTORY_LIMIT) : next
}

interface Transaction {
  /** Snapshot taken at beginTransaction(); committed as a single history entry. */
  snapshot: Scene
}

let activeTransaction: Transaction | null = null

export const useSceneStore = create<SceneStore>((set, get) => {
  const recordHistoryAndSet = (mutator: (scene: Scene) => Scene) => {
    set((state) => {
      const next = mutator(state.scene)
      // If inside a transaction, mutate scene but defer history entry
      if (activeTransaction) {
        return { scene: next }
      }
      return {
        scene: next,
        past: pushHistory(state.past, state.scene),
        future: [],
      }
    })
  }

  return {
    scene: emptyScene(),
    past: [],
    future: [],

    addElement: (element) => {
      const id = generateId(element.type)
      recordHistoryAndSet((scene) => ({
        ...scene,
        elements: [...scene.elements, { ...element, id } as SceneElement],
      }))
      return id
    },

    updateElement: (id, updates) => {
      recordHistoryAndSet((scene) => ({
        ...scene,
        elements: scene.elements.map((el) =>
          el.id === id ? ({ ...el, ...updates } as SceneElement) : el
        ),
      }))
    },

    deleteElement: (id) => {
      recordHistoryAndSet((scene) => ({
        elements: scene.elements.filter((el) => el.id !== id),
        selection: scene.selection.filter((s) => s !== id),
      }))
    },

    reorderElement: (id, toIndex) => {
      recordHistoryAndSet((scene) => {
        const from = scene.elements.findIndex((el) => el.id === id)
        if (from === -1) return scene
        const clamped = Math.max(0, Math.min(toIndex, scene.elements.length - 1))
        if (from === clamped) return scene
        const reordered = [...scene.elements]
        const [moved] = reordered.splice(from, 1)
        reordered.splice(clamped, 0, moved)
        return { ...scene, elements: reordered }
      })
    },

    select: (ids) => set((s) => ({ scene: { ...s.scene, selection: ids } })),
    selectOne: (id) =>
      set((s) => ({ scene: { ...s.scene, selection: id ? [id] : [] } })),
    clearSelection: () =>
      set((s) => ({ scene: { ...s.scene, selection: [] } })),

    beginTransaction: () => {
      if (activeTransaction) return
      activeTransaction = { snapshot: get().scene }
    },

    commitTransaction: () => {
      const tx = activeTransaction
      activeTransaction = null
      if (!tx) return
      // Only record history if the scene actually changed during the transaction
      if (tx.snapshot === get().scene) return
      set((state) => ({
        past: pushHistory(state.past, tx.snapshot),
        future: [],
      }))
    },

    abortTransaction: () => {
      const tx = activeTransaction
      activeTransaction = null
      if (!tx) return
      set({ scene: tx.snapshot })
    },

    undo: () => {
      if (activeTransaction) return
      set((state) => {
        if (state.past.length === 0) return state
        const previous = state.past[state.past.length - 1]
        return {
          scene: previous,
          past: state.past.slice(0, -1),
          future: [state.scene, ...state.future],
        }
      })
    },

    redo: () => {
      if (activeTransaction) return
      set((state) => {
        if (state.future.length === 0) return state
        const [next, ...rest] = state.future
        return {
          scene: next,
          past: pushHistory(state.past, state.scene),
          future: rest,
        }
      })
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    reset: () => {
      activeTransaction = null
      set({ scene: emptyScene(), past: [], future: [] })
    },
  }
})
