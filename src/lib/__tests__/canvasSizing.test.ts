import { describe, it, expect } from 'vitest'
import {
  canvasSizeForViewport,
  fitBoxToWidth,
  fitImageIntoBox,
  MOBILE_VERTICAL_CHROME
} from '../canvasSizing'

describe('canvasSizeForViewport', () => {
  it('fits the canvas inside the viewport width on phones (iPhone 14/15)', () => {
    const { width } = canvasSizeForViewport(390, 844)
    expect(width).toBeLessThanOrEqual(390 - 32)
    expect(width).toBeGreaterThan(0)
  })

  it('leaves vertical room for header, toolbar and bottom sheet on phones', () => {
    const { height } = canvasSizeForViewport(390, 844)
    expect(height).toBeLessThanOrEqual(844 - MOBILE_VERTICAL_CHROME)
  })

  it('keeps the canvas usable on small phones (iPhone SE)', () => {
    const { width, height } = canvasSizeForViewport(375, 667)
    expect(width).toBeLessThanOrEqual(375 - 32)
    expect(height).toBeLessThanOrEqual(667 - MOBILE_VERTICAL_CHROME)
    expect(width).toBeGreaterThan(200)
    expect(height).toBeGreaterThan(100)
  })

  it('never exceeds the 600px cap on wide phones in landscape', () => {
    const { width } = canvasSizeForViewport(740, 390)
    expect(width).toBe(600)
  })

  it('uses the tablet box between the breakpoints', () => {
    expect(canvasSizeForViewport(768, 1024)).toEqual({ width: 700, height: 500 })
    expect(canvasSizeForViewport(1023, 768)).toEqual({ width: 700, height: 500 })
  })

  it('uses the desktop box at and above 1024px', () => {
    expect(canvasSizeForViewport(1024, 768)).toEqual({ width: 900, height: 650 })
    expect(canvasSizeForViewport(1920, 1080)).toEqual({ width: 900, height: 650 })
  })
})

describe('fitBoxToWidth', () => {
  it('shrinks a box wider than the available space (iPad landscape column)', () => {
    // 11" iPad landscape lands on the desktop 900x650 box, but the 3/4 grid
    // column only offers ~830px — regression test for the iPad overflow fix.
    const { width, height } = fitBoxToWidth(900, 650, 830)
    expect(width).toBe(830)
    expect(height).toBeCloseTo(650 * (830 / 900))
  })

  it('never scales a box up when there is extra room', () => {
    expect(fitBoxToWidth(700, 500, 2000)).toEqual({ width: 700, height: 500 })
  })

  it('preserves the aspect ratio when scaling down', () => {
    const { width, height } = fitBoxToWidth(900, 650, 450)
    expect(width / height).toBeCloseTo(900 / 650)
  })

  it('tolerates a zero-width target without dividing by zero', () => {
    expect(fitBoxToWidth(0, 0, 500)).toEqual({ width: 0, height: 0 })
  })
})

describe('fitImageIntoBox', () => {
  it('returns the box itself while the image is still loading', () => {
    expect(fitImageIntoBox(600, 400, null)).toEqual({ width: 600, height: 400 })
    expect(fitImageIntoBox(600, 400, undefined)).toEqual({ width: 600, height: 400 })
  })

  it('letterboxes a wide image to the box width', () => {
    const { width, height } = fitImageIntoBox(600, 600, { width: 1200, height: 600 })
    expect(width).toBe(600)
    expect(height).toBe(300)
  })

  it('pillarboxes a tall image to the box height', () => {
    const { width, height } = fitImageIntoBox(600, 600, { width: 500, height: 1000 })
    expect(height).toBe(600)
    expect(width).toBe(300)
  })

  it('never exceeds the box in either dimension', () => {
    const shapes = [
      { width: 3000, height: 100 },
      { width: 100, height: 3000 },
      { width: 512, height: 512 }
    ]
    for (const img of shapes) {
      const { width, height } = fitImageIntoBox(358, 268, img)
      expect(width).toBeLessThanOrEqual(358)
      expect(height).toBeLessThanOrEqual(268)
      expect(width / height).toBeCloseTo(img.width / img.height)
    }
  })
})
