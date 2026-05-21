import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSceneStore } from '../useSceneStore'
import type { EmojiElement, TextElement } from '@/types/scene'

const textElement = (
  overrides: Partial<Omit<TextElement, 'id' | 'type'>> = {}
): Omit<TextElement, 'id'> => ({
  type: 'text',
  text: 'hello',
  x: 100,
  y: 100,
  width: 200,
  rotation: 0,
  fontSize: 24,
  fontFamily: 'Heebo',
  color: '#FFFFFF',
  stroke: '#000000',
  strokeWidth: 1,
  fontStyle: 'bold',
  isPlaceholder: false,
  ...overrides,
})

const emojiElement = (
  overrides: Partial<Omit<EmojiElement, 'id' | 'type'>> = {}
): Omit<EmojiElement, 'id'> => ({
  type: 'emoji',
  glyph: '🔥',
  x: 50,
  y: 50,
  size: 64,
  rotation: 0,
  ...overrides,
})

describe('useSceneStore', () => {
  beforeEach(() => {
    const { result } = renderHook(() => useSceneStore())
    act(() => {
      result.current.reset()
    })
  })

  describe('elements', () => {
    it('adds an element and returns its id', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement({ text: 'first' }))
      })
      expect(id).toMatch(/^text-/)
      expect(result.current.scene.elements).toHaveLength(1)
      expect(result.current.scene.elements[0].id).toBe(id)
    })

    it('updates an element while preserving other fields', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement({ text: 'original', fontSize: 24 }))
      })
      act(() => {
        result.current.updateElement(id, { text: 'updated' })
      })
      const el = result.current.scene.elements[0] as TextElement
      expect(el.text).toBe('updated')
      expect(el.fontSize).toBe(24)
    })

    it('deletes an element and removes it from selection', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement())
        result.current.selectOne(id)
      })
      expect(result.current.scene.selection).toEqual([id])
      act(() => {
        result.current.deleteElement(id)
      })
      expect(result.current.scene.elements).toHaveLength(0)
      expect(result.current.scene.selection).toEqual([])
    })

    it('reorders elements (z-order)', () => {
      const { result } = renderHook(() => useSceneStore())
      const ids: string[] = []
      act(() => {
        ids.push(result.current.addElement(textElement({ text: 'a' })))
        ids.push(result.current.addElement(textElement({ text: 'b' })))
        ids.push(result.current.addElement(textElement({ text: 'c' })))
      })
      // Move 'a' to the top
      act(() => {
        result.current.reorderElement(ids[0], 2)
      })
      const ordered = result.current.scene.elements.map((el) =>
        (el as TextElement).text
      )
      expect(ordered).toEqual(['b', 'c', 'a'])
    })

    it('clamps reorder index to valid range', () => {
      const { result } = renderHook(() => useSceneStore())
      const ids: string[] = []
      act(() => {
        ids.push(result.current.addElement(textElement({ text: 'a' })))
        ids.push(result.current.addElement(textElement({ text: 'b' })))
      })
      act(() => {
        result.current.reorderElement(ids[0], 99)
      })
      const ordered = result.current.scene.elements.map((el) =>
        (el as TextElement).text
      )
      expect(ordered).toEqual(['b', 'a'])
    })
  })

  describe('selection', () => {
    it('selection changes do not pollute history', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement())
      })
      const pastAfterAdd = result.current.past.length
      act(() => {
        result.current.selectOne(id)
        result.current.clearSelection()
        result.current.select([id])
      })
      expect(result.current.past.length).toBe(pastAfterAdd)
    })
  })

  describe('history', () => {
    it('undo reverts the last mutation', () => {
      const { result } = renderHook(() => useSceneStore())
      act(() => {
        result.current.addElement(textElement({ text: 'a' }))
      })
      act(() => {
        result.current.addElement(textElement({ text: 'b' }))
      })
      expect(result.current.scene.elements).toHaveLength(2)
      act(() => {
        result.current.undo()
      })
      expect(result.current.scene.elements).toHaveLength(1)
      expect((result.current.scene.elements[0] as TextElement).text).toBe('a')
    })

    it('redo replays an undone mutation', () => {
      const { result } = renderHook(() => useSceneStore())
      act(() => {
        result.current.addElement(textElement({ text: 'a' }))
        result.current.addElement(textElement({ text: 'b' }))
        result.current.undo()
      })
      expect(result.current.scene.elements).toHaveLength(1)
      act(() => {
        result.current.redo()
      })
      expect(result.current.scene.elements).toHaveLength(2)
      expect((result.current.scene.elements[1] as TextElement).text).toBe('b')
    })

    it('a new mutation clears the redo stack', () => {
      const { result } = renderHook(() => useSceneStore())
      act(() => {
        result.current.addElement(textElement({ text: 'a' }))
        result.current.addElement(textElement({ text: 'b' }))
        result.current.undo()
      })
      expect(result.current.canRedo()).toBe(true)
      act(() => {
        result.current.addElement(emojiElement())
      })
      expect(result.current.canRedo()).toBe(false)
    })

    it('canUndo / canRedo reflect availability', () => {
      const { result } = renderHook(() => useSceneStore())
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(false)
      act(() => {
        result.current.addElement(textElement())
      })
      expect(result.current.canUndo()).toBe(true)
      expect(result.current.canRedo()).toBe(false)
      act(() => {
        result.current.undo()
      })
      expect(result.current.canUndo()).toBe(false)
      expect(result.current.canRedo()).toBe(true)
    })

    it('caps history at the configured limit', () => {
      const { result } = renderHook(() => useSceneStore())
      act(() => {
        for (let i = 0; i < 60; i++) {
          result.current.addElement(textElement({ text: `t${i}` }))
        }
      })
      expect(result.current.past.length).toBe(50)
    })
  })

  describe('transactions', () => {
    it('collapses multiple updates into one history entry', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement({ x: 0, y: 0 }))
      })
      const pastAfterAdd = result.current.past.length
      act(() => {
        result.current.beginTransaction()
        result.current.updateElement(id, { x: 10, y: 10 })
        result.current.updateElement(id, { x: 20, y: 20 })
        result.current.updateElement(id, { x: 30, y: 30 })
        result.current.commitTransaction()
      })
      expect(result.current.past.length).toBe(pastAfterAdd + 1)
      const el = result.current.scene.elements[0] as TextElement
      expect(el.x).toBe(30)
      expect(el.y).toBe(30)
    })

    it('undoing a committed transaction restores pre-transaction state', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement({ x: 0 }))
      })
      act(() => {
        result.current.beginTransaction()
        result.current.updateElement(id, { x: 100 })
        result.current.updateElement(id, { x: 200 })
        result.current.commitTransaction()
      })
      act(() => {
        result.current.undo()
      })
      expect((result.current.scene.elements[0] as TextElement).x).toBe(0)
    })

    it('aborting a transaction restores pre-transaction scene', () => {
      const { result } = renderHook(() => useSceneStore())
      let id = ''
      act(() => {
        id = result.current.addElement(textElement({ x: 0 }))
      })
      act(() => {
        result.current.beginTransaction()
        result.current.updateElement(id, { x: 999 })
        result.current.abortTransaction()
      })
      expect((result.current.scene.elements[0] as TextElement).x).toBe(0)
      // Abort should not produce a history entry
      expect(result.current.past.length).toBe(1) // just the add
    })

    it('commit without changes does not push history', () => {
      const { result } = renderHook(() => useSceneStore())
      act(() => {
        result.current.addElement(textElement())
      })
      const pastAfterAdd = result.current.past.length
      act(() => {
        result.current.beginTransaction()
        result.current.commitTransaction()
      })
      expect(result.current.past.length).toBe(pastAfterAdd)
    })
  })

  describe('mixed element types', () => {
    it('supports text, emoji, image, and location elements', () => {
      const { result } = renderHook(() => useSceneStore())
      act(() => {
        result.current.addElement(textElement())
        result.current.addElement(emojiElement())
        result.current.addElement({
          type: 'image',
          src: 'https://example.com/sticker.png',
          x: 10,
          y: 10,
          width: 64,
          height: 64,
          rotation: 0,
          source: 'curated',
        })
        result.current.addElement({
          type: 'location',
          display_name: 'Florentin, Tel Aviv',
          latitude: 32.06,
          longitude: 34.77,
          x: 0,
          y: 0,
          width: 300,
          fontSize: 24,
          color: '#FFFFFF',
          rotation: 0,
        })
      })
      const types = result.current.scene.elements.map((el) => el.type)
      expect(types).toEqual(['text', 'emoji', 'image', 'location'])
    })
  })
})
