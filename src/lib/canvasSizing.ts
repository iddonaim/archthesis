/**
 * Pure sizing math for the meme editor canvas.
 *
 * The canvas has to stay visible and usable on every device, so the sizing
 * logic lives here where it can be unit-tested without Konva or a real DOM:
 *
 * 1. `canvasSizeForViewport` — picks the target canvas box for the viewport
 *    (breakpoint logic used by CreatePage).
 * 2. `fitBoxToWidth` — shrinks that box to the width the container actually
 *    offers (CanvasEditor measures the container; iPad-width viewports can
 *    land on a breakpoint box wider than the grid column it lives in).
 * 3. `fitImageIntoBox` — fits the meme image inside the box, preserving the
 *    image's aspect ratio.
 */

export interface CanvasSize {
  width: number
  height: number
}

/** Mobile breakpoint: below this the editor uses the phone layout. */
export const MOBILE_BREAKPOINT = 768
/** Desktop breakpoint: at or above this the editor uses the desktop layout. */
export const DESKTOP_BREAKPOINT = 1024

/**
 * Vertical space reserved on phones for everything that isn't canvas
 * (header, page heading, editor toolbar, bottom sheet).
 */
export const MOBILE_VERTICAL_CHROME = 300

/** Target canvas box for a given viewport (CreatePage breakpoints). */
export function canvasSizeForViewport(viewportWidth: number, viewportHeight: number): CanvasSize {
  if (viewportWidth < MOBILE_BREAKPOINT) {
    // Mobile: fit to screen width with padding
    const width = Math.min(viewportWidth - 32, 600)
    const height = Math.min(width * 0.75, viewportHeight - MOBILE_VERTICAL_CHROME)
    return { width, height }
  }
  if (viewportWidth < DESKTOP_BREAKPOINT) {
    // Tablet: medium size
    return { width: 700, height: 500 }
  }
  // Desktop: full size
  return { width: 900, height: 650 }
}

/**
 * Scale a target box down (never up) to fit the width actually available,
 * preserving its aspect ratio.
 */
export function fitBoxToWidth(targetWidth: number, targetHeight: number, availableWidth: number): CanvasSize {
  const fitScale = targetWidth > 0 ? Math.min(1, availableWidth / targetWidth) : 1
  return { width: targetWidth * fitScale, height: targetHeight * fitScale }
}

/**
 * Fit an image inside a box, preserving the image's aspect ratio.
 * Without an image the box itself is returned.
 */
export function fitImageIntoBox(
  boxWidth: number,
  boxHeight: number,
  image?: { width: number; height: number } | null
): CanvasSize {
  if (!image) return { width: boxWidth, height: boxHeight }

  const imgRatio = image.width / image.height
  const canvasRatio = boxWidth / boxHeight

  if (imgRatio > canvasRatio) {
    // Image is wider
    return { width: boxWidth, height: boxWidth / imgRatio }
  }
  // Image is taller
  return { width: boxHeight * imgRatio, height: boxHeight }
}
