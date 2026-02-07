import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEditorStore } from '../useEditorStore'

describe('useEditorStore', () => {
  beforeEach(() => {
    // Reset store before each test
    const { result } = renderHook(() => useEditorStore())
    act(() => {
      result.current.resetEditor()
    })
  })

  describe('Text Box Management', () => {
    it('adds a text box', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTextBox({
          text: 'Test text',
          x: 100,
          y: 100,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
      })

      expect(result.current.textBoxes).toHaveLength(1)
      expect(result.current.textBoxes[0].text).toBe('Test text')
    })

    it('updates a text box', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTextBox({
          text: 'Original',
          x: 100,
          y: 100,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
      })

      const textBoxId = result.current.textBoxes[0].id

      act(() => {
        result.current.updateTextBox(textBoxId, { text: 'Updated' })
      })

      expect(result.current.textBoxes[0].text).toBe('Updated')
    })

    it('deletes a text box', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTextBox({
          text: 'To delete',
          x: 100,
          y: 100,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
      })

      const textBoxId = result.current.textBoxes[0].id

      act(() => {
        result.current.deleteTextBox(textBoxId)
      })

      expect(result.current.textBoxes).toHaveLength(0)
    })

    it('selects a text box', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTextBox({
          text: 'Select me',
          x: 100,
          y: 100,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
      })

      const textBoxId = result.current.textBoxes[0].id

      act(() => {
        result.current.selectTextBox(textBoxId)
      })

      expect(result.current.selectedTextBoxId).toBe(textBoxId)
    })

    it('clears all text boxes', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTextBox({
          text: 'Text 1',
          x: 100,
          y: 100,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
        result.current.addTextBox({
          text: 'Text 2',
          x: 200,
          y: 200,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
      })

      expect(result.current.textBoxes).toHaveLength(2)

      act(() => {
        result.current.clearTextBoxes()
      })

      expect(result.current.textBoxes).toHaveLength(0)
    })
  })

  describe('Sticker Management', () => {
    it('adds a sticker', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addSticker({
          emoji: '😀',
          x: 100,
          y: 100,
          fontSize: 48,
          rotation: 0
        })
      })

      expect(result.current.stickers).toHaveLength(1)
      expect(result.current.stickers[0].emoji).toBe('😀')
    })

    it('deletes a sticker', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addSticker({
          emoji: '😀',
          x: 100,
          y: 100,
          fontSize: 48,
          rotation: 0
        })
      })

      const stickerId = result.current.stickers[0].id

      act(() => {
        result.current.deleteSticker(stickerId)
      })

      expect(result.current.stickers).toHaveLength(0)
    })
  })

  describe('Tags Management', () => {
    it('sets tags', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setSelectedTags(['funny', 'relatable'])
      })

      expect(result.current.selectedTags).toEqual(['funny', 'relatable'])
    })

    it('adds a tag', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTag('funny')
      })

      expect(result.current.selectedTags).toContain('funny')
    })

    it('removes a tag', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setSelectedTags(['funny', 'relatable'])
      })

      act(() => {
        result.current.removeTag('funny')
      })

      expect(result.current.selectedTags).not.toContain('funny')
      expect(result.current.selectedTags).toContain('relatable')
    })

    it('limits tags to 3', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTag('tag1')
        result.current.addTag('tag2')
        result.current.addTag('tag3')
        result.current.addTag('tag4')
      })

      expect(result.current.selectedTags).toHaveLength(3)
    })

    it('prevents duplicate tags', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTag('funny')
        result.current.addTag('funny')
      })

      expect(result.current.selectedTags).toHaveLength(1)
    })
  })

  describe('Location Management', () => {
    it('sets selected location', () => {
      const { result } = renderHook(() => useEditorStore())

      const location = {
        latitude: 32.0853,
        longitude: 34.7818,
        display_name: 'Tel Aviv, Israel'
      }

      act(() => {
        result.current.setSelectedLocation(location)
      })

      expect(result.current.selectedLocation).toEqual(location)
    })

    it('updates location transform', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.setSelectedLocation({
          latitude: 32.0853,
          longitude: 34.7818,
          display_name: 'Tel Aviv'
        })
      })

      act(() => {
        result.current.updateLocationTransform({ x: 100, y: 200 })
      })

      expect(result.current.selectedLocation?.x).toBe(100)
      expect(result.current.selectedLocation?.y).toBe(200)
    })
  })

  describe('Reset', () => {
    it('resets editor to initial state', () => {
      const { result } = renderHook(() => useEditorStore())

      act(() => {
        result.current.addTextBox({
          text: 'Test',
          x: 100,
          y: 100,
          width: 200,
          fontSize: 24,
          color: '#FFFFFF',
          fontFamily: 'Arial',
          stroke: '#000000',
          strokeWidth: 1,
          fontStyle: 'bold',
          rotation: 0
        })
        result.current.addTag('funny')
        result.current.setUsername('TestUser')
      })

      expect(result.current.textBoxes).toHaveLength(1)
      expect(result.current.selectedTags).toHaveLength(1)

      act(() => {
        result.current.resetEditor()
      })

      expect(result.current.textBoxes).toHaveLength(0)
      expect(result.current.selectedTags).toHaveLength(0)
      expect(result.current.username).toBe('')
    })
  })
})
