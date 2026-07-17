import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@/test/utils'
import userEvent from '@testing-library/user-event'
import { forwardRef, useImperativeHandle } from 'react'
import CreatePage from '@/pages/CreatePage'
import { useEditorStore } from '@/stores/useEditorStore'
import { useSceneStore } from '@/stores/useSceneStore'

// Konva needs a real canvas; stub the editor but keep the getStage handle
// CreatePage relies on for publishing.
const mockStage = { toDataURL: vi.fn(() => 'data:image/png;base64,x') }
vi.mock('@/components/editor/CanvasEditor', () => ({
  default: forwardRef((_props, ref) => {
    useImperativeHandle(ref, () => ({ getStage: () => mockStage }))
    return <div data-testid="canvas-editor" />
  })
}))
vi.mock('@/components/editor/SelectionToolbar', () => ({
  default: () => <div data-testid="selection-toolbar" />
}))
vi.mock('@/components/editor/TemplateSelector', () => ({
  default: () => <div data-testid="template-selector" />
}))
vi.mock('@/components/editor/panels/TextPanel', () => ({
  default: () => <div data-testid="text-panel" />
}))
vi.mock('@/components/editor/panels/EmojiPanel', () => ({
  default: () => <div data-testid="emoji-panel" />
}))
vi.mock('@/components/editor/panels/StickerPanel', () => ({
  default: () => <div data-testid="sticker-panel" />
}))
vi.mock('@/components/editor/panels/TagsPanel', () => ({
  default: () => <div data-testid="tags-panel" />
}))
vi.mock('@/components/editor/panels/LocationPanel', () => ({
  default: () => <div data-testid="location-panel" />
}))
vi.mock('@/components/layout/Layout', () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>
}))

const mockPublishMeme = vi.fn(async () => ({ success: true, imageUrl: 'url', memeId: 'id' }))
vi.mock('@/hooks/usePublishMeme', () => ({
  usePublishMeme: () => ({ publishMeme: mockPublishMeme, isPublishing: false })
}))

function openEditor() {
  // An image in the store is what switches CreatePage from the template
  // selector to the editor view.
  useEditorStore.setState({ currentImageUrl: 'blob:meme', currentTemplateId: 'test' })
}

function getSheet(): HTMLElement {
  // The publish button lives in the bottom sheet's footer.
  const publish = screen.getByRole('button', { name: /פרסם גיחוך/ })
  const sheet = publish.closest('.fixed')
  expect(sheet).not.toBeNull()
  return sheet as HTMLElement
}

describe('CreatePage mobile bottom sheet', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.setItem('hasAcceptedTerms', 'true')
    useEditorStore.getState().resetEditor()
    useSceneStore.getState().reset()
  })

  it('shows the publish button as soon as the editor opens (sheet collapsed)', () => {
    openEditor()
    render(<CreatePage />)

    const publish = screen.getByRole('button', { name: /פרסם גיחוך/ })
    expect(publish).toBeInTheDocument()
    // The button must not sit inside the collapsed (hidden) tab-content area,
    // or it would vanish with it.
    expect(publish.closest('.hidden')).toBeNull()
  })

  it('does not clip the collapsed sheet with a fixed pixel height', () => {
    // Regression: a fixed collapsed height (h-[74px]) used to push the publish
    // footer below the viewport on phones, making publishing impossible.
    openEditor()
    render(<CreatePage />)

    const sheet = getSheet()
    expect(sheet.className).not.toMatch(/h-\[\d+px\]/)
    expect(sheet.className).not.toContain('mobile-bottom-sheet-half')
    expect(sheet.className).not.toContain('mobile-bottom-sheet-tall')
  })

  it('hides only the tab content while collapsed, and reveals it when a tab is clicked', async () => {
    const user = userEvent.setup()
    openEditor()
    render(<CreatePage />)

    const textPanel = screen.getByTestId('text-panel')
    const contentArea = textPanel.closest('.overflow-y-auto') as HTMLElement
    expect(contentArea).not.toBeNull()
    // Collapsed: content hidden on mobile, kept visible on desktop via lg:block
    expect(contentArea.className).toContain('hidden')
    expect(contentArea.className).toContain('lg:block')

    await user.click(screen.getByRole('button', { name: /טקסט/ }))

    expect(contentArea.className).not.toContain('hidden')
    expect(getSheet().className).toContain('mobile-bottom-sheet-half')
  })

  it('toggles between collapsed and half height when the drag handle is tapped', () => {
    // Pointer-drag on the handle is mobile-only; simulate a phone viewport
    Object.defineProperty(window, 'innerWidth', { value: 390, configurable: true, writable: true })
    openEditor()
    render(<CreatePage />)

    const handle = screen.getByRole('button', { name: /חלונית הכלים/ })

    // Tap = pointer down + up without movement
    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 700 })
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 700 })
    expect(getSheet().className).toContain('mobile-bottom-sheet-half')

    fireEvent.pointerDown(handle, { pointerId: 1, clientY: 700 })
    fireEvent.pointerUp(handle, { pointerId: 1, clientY: 700 })
    expect(getSheet().className).not.toContain('mobile-bottom-sheet-half')
  })

  it('opens the sheet with the keyboard for accessibility', async () => {
    const user = userEvent.setup()
    openEditor()
    render(<CreatePage />)

    const handle = screen.getByRole('button', { name: /חלונית הכלים/ })
    handle.focus()
    await user.keyboard('{Enter}')
    expect(getSheet().className).toContain('mobile-bottom-sheet-half')
  })

  it('keeps the publish button rendered in the expanded sheet too', async () => {
    const user = userEvent.setup()
    openEditor()
    render(<CreatePage />)

    await user.click(screen.getByRole('button', { name: /סטיקרים/ }))

    const publish = screen.getByRole('button', { name: /פרסם גיחוך/ })
    expect(publish).toBeInTheDocument()
    expect(publish.closest('.hidden')).toBeNull()
  })

  it('publishes from the collapsed sheet without expanding first', async () => {
    const user = userEvent.setup()
    openEditor()
    render(<CreatePage />)

    await user.click(screen.getByRole('button', { name: /פרסם גיחוך/ }))

    expect(mockPublishMeme).toHaveBeenCalledTimes(1)
    expect(mockPublishMeme).toHaveBeenCalledWith({ current: mockStage })
  })

  it('renders the canvas editor alongside the sheet', () => {
    openEditor()
    render(<CreatePage />)

    expect(screen.getByTestId('canvas-editor')).toBeInTheDocument()
    expect(screen.getByTestId('selection-toolbar')).toBeInTheDocument()
  })
})
