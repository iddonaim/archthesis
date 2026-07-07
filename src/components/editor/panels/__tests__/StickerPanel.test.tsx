import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import StickerPanel from '../StickerPanel'
import { useSceneStore } from '@/stores/useSceneStore'
import { useEditorStore } from '@/stores/useEditorStore'
import { STICKER_PACKS } from '@/data/stickerPacks'
import { loadUserStickers, saveUserSticker, removeUserSticker, USER_STICKER_LIMIT } from '@/lib/userStickers'
import type { ImageElement } from '@/types/scene'

describe('StickerPanel', () => {
  beforeEach(() => {
    localStorage.clear()
    act(() => {
      useSceneStore.getState().reset()
      useEditorStore.getState().resetEditor()
    })
  })

  it('renders a pack switcher with the personal library and every pack', () => {
    render(<StickerPanel />)
    expect(screen.getByTitle('הסטיקרים שלי')).toBeInTheDocument()
    for (const pack of STICKER_PACKS) {
      expect(screen.getByTitle(pack.label)).toBeInTheDocument()
    }
    // First pack is active by default and its stickers are visible
    for (const sticker of STICKER_PACKS[0].stickers) {
      expect(screen.getByTitle(sticker.label)).toBeInTheDocument()
    }
  })

  it('switches packs when a pack button is clicked', () => {
    render(<StickerPanel />)
    const secondPack = STICKER_PACKS[1]
    fireEvent.click(screen.getByTitle(secondPack.label))
    for (const sticker of secondPack.stickers) {
      expect(screen.getByTitle(sticker.label)).toBeInTheDocument()
    }
  })

  it('adds a centered image element to the scene when a sticker is clicked', () => {
    act(() => {
      useEditorStore.getState().setCanvasDimensions({ width: 800, height: 600 })
    })
    render(<StickerPanel />)

    const first = STICKER_PACKS[0].stickers[0]
    fireEvent.click(screen.getByTitle(first.label))

    const { scene } = useSceneStore.getState()
    expect(scene.elements).toHaveLength(1)
    const el = scene.elements[0] as ImageElement
    expect(el.type).toBe('image')
    expect(el.src).toBe(first.src)
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
    const wide = STICKER_PACKS.flatMap((p) => p.stickers).find((s) => s.aspect !== 1)
    expect(wide).toBeDefined()
    if (!wide) return

    const pack = STICKER_PACKS.find((p) => p.stickers.includes(wide))!
    fireEvent.click(screen.getByTitle(pack.label))
    fireEvent.click(screen.getByTitle(wide.label))
    const el = useSceneStore.getState().scene.elements[0] as ImageElement
    expect(el.width / el.height).toBeCloseTo(wide.aspect, 5)
  })

  it('shows saved personal stickers in the "mine" pack and can remove them', () => {
    saveUserSticker('data:image/png;base64,AAAA', 1.5)
    render(<StickerPanel />)

    fireEvent.click(screen.getByTitle('הסטיקרים שלי'))
    expect(screen.getByAltText('סטיקר אישי')).toBeInTheDocument()

    // Clicking a saved sticker adds it to the canvas
    fireEvent.click(screen.getByTitle('הוסיפו לקנבס'))
    const el = useSceneStore.getState().scene.elements[0] as ImageElement
    expect(el.src).toBe('data:image/png;base64,AAAA')

    // Removing it empties the library
    fireEvent.click(screen.getByTitle('הסירו מהספרייה'))
    expect(screen.queryByAltText('סטיקר אישי')).not.toBeInTheDocument()
    expect(loadUserStickers()).toHaveLength(0)
  })
})

describe('userStickers library', () => {
  beforeEach(() => localStorage.clear())

  it('persists newest-first and caps the library size', () => {
    for (let i = 0; i < USER_STICKER_LIMIT + 3; i++) {
      saveUserSticker(`data:image/png;base64,item${i}`, 1)
    }
    const stickers = loadUserStickers()
    expect(stickers).toHaveLength(USER_STICKER_LIMIT)
    expect(stickers[0].src).toContain(`item${USER_STICKER_LIMIT + 2}`)
  })

  it('removes by id', () => {
    const { stickers } = saveUserSticker('data:image/png;base64,keep', 1)
    saveUserSticker('data:image/png;base64,drop', 1)
    const afterRemove = removeUserSticker(loadUserStickers()[0].id)
    expect(afterRemove).toHaveLength(1)
    expect(afterRemove[0].id).toBe(stickers[0].id)
  })

  it('survives corrupted storage', () => {
    localStorage.setItem('userStickerLibrary_v1', '{not json')
    expect(loadUserStickers()).toEqual([])
  })
})
