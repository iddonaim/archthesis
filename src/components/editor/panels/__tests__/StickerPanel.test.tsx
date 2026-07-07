import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import StickerPanel from '../StickerPanel'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { CURATED_STICKERS } from '@/data/stickers'
import type { ImageElement } from '@/types/scene'

describe('StickerPanel', () => {
  beforeEach(() => {
    act(() => {
      useSceneStore.getState().reset()
      useEditorStore.getState().resetEditor()
    })
  })

  it('renders the upload button and every curated sticker', () => {
    render(<StickerPanel />)
    expect(screen.getByText('העלו תמונה כסטיקר')).toBeInTheDocument()
    for (const sticker of CURATED_STICKERS) {
      expect(screen.getByAltText(sticker.label)).toBeInTheDocument()
    }
  })

  it('adds a centered image element to the scene when a curated sticker is clicked', () => {
    act(() => {
      useEditorStore.getState().setCanvasDimensions({ width: 800, height: 600 })
    })
    render(<StickerPanel />)

    fireEvent.click(screen.getByTitle(CURATED_STICKERS[0].label))

    const { scene } = useSceneStore.getState()
    expect(scene.elements).toHaveLength(1)
    const el = scene.elements[0] as ImageElement
    expect(el.type).toBe('image')
    expect(el.src).toBe(CURATED_STICKERS[0].src)
    expect(el.source).toBe('curated')
    // Centered on the canvas (image elements are center-anchored)
    expect(el.x).toBe(400)
    expect(el.y).toBe(300)
    expect(el.width).toBeGreaterThan(0)
    expect(el.height).toBeGreaterThan(0)
    // The new sticker is selected so the transformer/toolbar appear immediately
    expect(scene.selection).toEqual([el.id])
  })

  it('keeps the artwork aspect ratio for non-square stickers', () => {
    render(<StickerPanel />)
    const wide = CURATED_STICKERS.find((s) => s.aspect !== 1)
    if (!wide) return // pack currently has one, but don't fail if it changes

    fireEvent.click(screen.getByTitle(wide.label))
    const el = useSceneStore.getState().scene.elements[0] as ImageElement
    expect(el.width / el.height).toBeCloseTo(wide.aspect, 5)
  })
})
