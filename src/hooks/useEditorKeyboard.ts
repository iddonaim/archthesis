import { useEffect, useRef } from 'react'
import { useSceneStore } from '@/stores/useSceneStore'

const ARROW_KEYS = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight']

const isTypingTarget = (target: EventTarget | null): boolean => {
  const el = target as HTMLElement | null
  if (!el) return false
  return (
    el.tagName === 'INPUT' ||
    el.tagName === 'TEXTAREA' ||
    el.isContentEditable
  )
}

/**
 * Keyboard support for the canvas editor:
 *  - Delete / Backspace   removes the selected element
 *  - Arrow keys           nudge the selected element (Shift = larger steps)
 *  - Escape               clears the selection
 *  - Ctrl/Cmd+Z           undo, Ctrl/Cmd+Shift+Z or Ctrl/Cmd+Y redo
 *
 * All shortcuts are ignored while the user is typing in an input, textarea
 * (including the canvas's inline text editor) or contenteditable element.
 */
export function useEditorKeyboard() {
  // Coalesce a held-down arrow key into a single undo entry
  const nudging = useRef(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingTarget(e.target)) return

      const store = useSceneStore.getState()
      const { scene } = store
      const selectedId = scene.selection[0]
      const selected = scene.elements.find((el) => el.id === selectedId)

      // Undo / redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) store.redo()
        else store.undo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        store.redo()
        return
      }

      if (e.key === 'Escape') {
        store.clearSelection()
        return
      }

      if (!selected) return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        store.deleteElement(selected.id)
        return
      }

      if (ARROW_KEYS.includes(e.key)) {
        e.preventDefault()
        if (!nudging.current) {
          nudging.current = true
          store.beginTransaction()
        }
        const step = e.shiftKey ? 10 : 2
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        store.updateElement(selected.id, {
          x: (selected.x ?? 0) + dx,
          y: (selected.y ?? 0) + dy,
        })
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (ARROW_KEYS.includes(e.key) && nudging.current) {
        nudging.current = false
        useSceneStore.getState().commitTransaction()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      // Never leave a nudge transaction dangling when the editor unmounts
      if (nudging.current) {
        nudging.current = false
        useSceneStore.getState().commitTransaction()
      }
    }
  }, [])
}
