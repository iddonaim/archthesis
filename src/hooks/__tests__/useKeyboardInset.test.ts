import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useKeyboardInset } from '../useKeyboardInset'

class MockVisualViewport extends EventTarget {
  height = 800
  offsetTop = 0
}

let mockViewport: MockVisualViewport
let originalDescriptor: PropertyDescriptor | undefined

beforeEach(() => {
  mockViewport = new MockVisualViewport()
  originalDescriptor = Object.getOwnPropertyDescriptor(window, 'visualViewport')
  Object.defineProperty(window, 'visualViewport', { value: mockViewport, configurable: true })
  Object.defineProperty(window, 'innerHeight', { value: 800, configurable: true, writable: true })
})

afterEach(() => {
  if (originalDescriptor) Object.defineProperty(window, 'visualViewport', originalDescriptor)
  else delete (window as { visualViewport?: unknown }).visualViewport
})

describe('useKeyboardInset', () => {
  it('reports no inset while the keyboard is closed', () => {
    const { result } = renderHook(() => useKeyboardInset())
    expect(result.current.keyboardInset).toBe(0)
    expect(result.current.visualHeight).toBe(800)
  })

  it('reports the covered height when the keyboard opens (visual viewport shrinks)', () => {
    const { result } = renderHook(() => useKeyboardInset())

    act(() => {
      mockViewport.height = 500 // 300px keyboard
      mockViewport.dispatchEvent(new Event('resize'))
    })

    expect(result.current.keyboardInset).toBe(300)
    expect(result.current.visualHeight).toBe(500)
  })

  it('accounts for the visual viewport being scrolled (iOS offsetTop)', () => {
    const { result } = renderHook(() => useKeyboardInset())

    act(() => {
      // iOS often scrolls the layout viewport when focusing an input:
      // 800 layout - 500 visible - 100 above = 200 covered below.
      mockViewport.height = 500
      mockViewport.offsetTop = 100
      mockViewport.dispatchEvent(new Event('scroll'))
    })

    expect(result.current.keyboardInset).toBe(200)
  })

  it('ignores small height changes from collapsing browser chrome', () => {
    const { result } = renderHook(() => useKeyboardInset())

    act(() => {
      mockViewport.height = 760 // 40px URL-bar shift, not a keyboard
      mockViewport.dispatchEvent(new Event('resize'))
    })

    expect(result.current.keyboardInset).toBe(0)
    expect(result.current.visualHeight).toBe(760)
  })

  it('drops the inset back to zero when the keyboard closes', () => {
    const { result } = renderHook(() => useKeyboardInset())

    act(() => {
      mockViewport.height = 500
      mockViewport.dispatchEvent(new Event('resize'))
    })
    expect(result.current.keyboardInset).toBe(300)

    act(() => {
      mockViewport.height = 800
      mockViewport.dispatchEvent(new Event('resize'))
    })
    expect(result.current.keyboardInset).toBe(0)
  })
})
