import { useEffect, useState } from 'react'

/**
 * Tracks how much of the layout viewport the software keyboard covers.
 *
 * iOS Safari (and Chrome Android with the default `resizes-visual` behavior)
 * does NOT move `position: fixed` elements when the keyboard opens — it only
 * shrinks the *visual* viewport. A bottom-anchored bar therefore ends up
 * behind the keyboard while the user types. The inset returned here can be
 * applied as a `bottom` offset to lift such bars back above the keyboard.
 *
 * Small height differences (collapsing URL bars, overscroll) are ignored via
 * a threshold — real keyboards are far taller than browser chrome shifts.
 */
const KEYBOARD_THRESHOLD_PX = 80

export interface KeyboardInset {
  /** px currently covered by the keyboard at the bottom of the layout viewport (0 = closed) */
  keyboardInset: number
  /** current visual viewport height in px, or null where visualViewport is unsupported */
  visualHeight: number | null
}

export function useKeyboardInset(): KeyboardInset {
  const [inset, setInset] = useState(0)
  const [visualHeight, setVisualHeight] = useState<number | null>(null)

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return

    const update = () => {
      // The gap below the visual viewport inside the layout viewport is
      // what the keyboard (plus any bottom browser chrome) covers.
      const gap = window.innerHeight - vv.height - vv.offsetTop
      setInset(gap >= KEYBOARD_THRESHOLD_PX ? Math.round(gap) : 0)
      setVisualHeight(vv.height)
    }

    update()
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  return { keyboardInset: inset, visualHeight }
}
