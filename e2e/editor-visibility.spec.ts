import { test, expect, type Page, type BrowserContext } from '@playwright/test'

/**
 * Canvas visibility & usability tests for the meme editor.
 *
 * Regression coverage for two real-device bugs:
 *  - iPhone: the collapsed bottom sheet clipped the publish button off-screen,
 *    so memes could not be published on phones at all.
 *  - iPad landscape: the Konva Stage overflowed its grid column and bled over
 *    the header, footer and tools panel.
 *
 * All external traffic (Firebase, imgflip template images) is stubbed so the
 * tests are hermetic and runnable offline.
 */

async function stubExternalTraffic(context: BrowserContext) {
  // Placeholder JPEG generated in-browser, served for every template image.
  const imgPage = await context.newPage()
  await imgPage.setContent('<body style="margin:0"><div style="width:600px;height:400px;background:linear-gradient(#f90,#09f)"></div></body>')
  const templateJpeg = await imgPage.locator('div').screenshot({ type: 'jpeg' })
  await imgPage.close()

  await context.route(/^https?:\/\/(?!localhost|127\.0\.0\.1)/, route => {
    if (route.request().url().includes('imgflip')) {
      return route.fulfill({ contentType: 'image/jpeg', body: templateJpeg })
    }
    return route.abort()
  })
}

async function openEditorWithTemplate(page: Page) {
  await page.goto('/create', { waitUntil: 'domcontentloaded' })
  // Template grid → click the first template → Konva editor mounts.
  await page.locator('img').first().click()
  await page.locator('canvas').first().waitFor()
  // Let layout, fonts and the entry animation settle.
  await page.waitForTimeout(1000)
}

test.beforeEach(async ({ context }) => {
  await context.addInitScript(() => {
    localStorage.setItem('hasAcceptedTerms', 'true')
    sessionStorage.setItem('hasAcceptedTerms', 'true')
  })
  await stubExternalTraffic(context)
})

const publishButton = (page: Page) =>
  page.getByRole('button', { name: /פרסם גיחוך/ }).first()

/** Viewport-relative edges of the bottom sheet and the sticky header. */
const sheetAndHeaderEdges = (page: Page) =>
  page.evaluate(() => {
    const btn = [...document.querySelectorAll('button')].find(b => (b.textContent ?? '').includes('פרסם גיחוך'))
    const sheet = btn?.closest('.fixed')
    const header = document.querySelector('header')
    return {
      sheetTop: sheet ? sheet.getBoundingClientRect().top : Number.POSITIVE_INFINITY,
      headerBottom: header ? header.getBoundingClientRect().bottom : 0
    }
  })

async function expectFullyInViewport(page: Page, locator: ReturnType<typeof publishButton>, label: string) {
  const box = await locator.boundingBox()
  expect(box, `${label} should have a bounding box`).not.toBeNull()
  const viewport = page.viewportSize()!
  expect(box!.y, `${label} top edge should be on-screen`).toBeGreaterThanOrEqual(0)
  expect(box!.y + box!.height, `${label} bottom edge should be on-screen (viewport ${viewport.height}px)`).toBeLessThanOrEqual(viewport.height)
  expect(box!.x, `${label} left edge should be on-screen`).toBeGreaterThanOrEqual(0)
  expect(box!.x + box!.width, `${label} right edge should be on-screen (viewport ${viewport.width}px)`).toBeLessThanOrEqual(viewport.width)
}

/** The element actually receiving taps at the button's center must be the button. */
async function expectTappable(page: Page, name: RegExp, label: string) {
  const tappable = await page.evaluate((source) => {
    const re = new RegExp(source)
    const btn = [...document.querySelectorAll('button')].find(b => re.test(b.textContent ?? ''))
    if (!btn) return { found: false, tappable: false }
    const r = btn.getBoundingClientRect()
    const el = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
    return { found: true, tappable: el === btn || btn.contains(el) }
  }, name.source)
  expect(tappable.found, `${label}: button should exist`).toBe(true)
  expect(tappable.tappable, `${label}: button should receive taps (not covered or off-screen)`).toBe(true)
}

const phones = [
  { name: 'iPhone 14/15', viewport: { width: 390, height: 844 } },
  { name: 'iPhone SE', viewport: { width: 375, height: 667 } },
  { name: 'small Android', viewport: { width: 360, height: 740 } }
]

for (const phone of phones) {
  test.describe(`${phone.name} (${phone.viewport.width}x${phone.viewport.height})`, () => {
    test.use({
      viewport: phone.viewport,
      hasTouch: true,
      isMobile: true,
      userAgent:
        'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
    })

    test('publish button is visible and tappable right after opening the editor', async ({ page }) => {
      await openEditorWithTemplate(page)

      // The bug: with the sheet collapsed (the initial state), the publish
      // footer rendered below the bottom of the screen.
      await expectFullyInViewport(page, publishButton(page), 'publish button (collapsed sheet)')
      await expectTappable(page, /פרסם גיחוך/, 'collapsed sheet')
    })

    test('publish button stays visible with the tools sheet expanded', async ({ page }) => {
      await openEditorWithTemplate(page)

      // Tapping a tool tab auto-expands the bottom sheet.
      await page.getByRole('button', { name: /טקסט/ }).first().click()
      await page.waitForTimeout(500) // sheet expand animation

      await expectFullyInViewport(page, publishButton(page), 'publish button (expanded sheet)')
      await expectTappable(page, /פרסם גיחוך/, 'expanded sheet')
    })

    test('canvas and publish button are both visible with no scrolling at all', async ({ page }) => {
      await openEditorWithTemplate(page)

      // With the compact mobile toolbar the whole working set — canvas plus
      // publish button — must fit on the first screen, no scrolling needed.
      const canvas = page.locator('canvas').first()
      await expectFullyInViewport(page, canvas, 'canvas')
      await expectFullyInViewport(page, publishButton(page), 'publish button')

      const canvasBox = (await canvas.boundingBox())!
      const { sheetTop, headerBottom } = await sheetAndHeaderEdges(page)
      expect(canvasBox.y + canvasBox.height, 'canvas should end above the bottom sheet').toBeLessThanOrEqual(sheetTop)
      expect(canvasBox.y, 'canvas should start below the sticky header').toBeGreaterThanOrEqual(headerBottom - 1)
    })

    test('canvas can still be seen whole while editing with the half-open sheet', async ({ page }) => {
      await openEditorWithTemplate(page)

      await page.getByRole('button', { name: /טקסט/ }).first().click()
      await page.waitForTimeout(500) // sheet expand animation

      const canvas = page.locator('canvas').first()
      let canvasBox = (await canvas.boundingBox())!
      const { sheetTop, headerBottom } = await sheetAndHeaderEdges(page)

      // The half sheet must leave a band big enough for the whole canvas...
      expect(canvasBox.height, 'canvas must fit between header and half-open sheet').toBeLessThanOrEqual(sheetTop - headerBottom)

      // ...and scrolling the canvas into that band must actually reveal all of it.
      await page.evaluate((delta) => window.scrollBy(0, delta), canvasBox.y - headerBottom - 4)
      await page.waitForTimeout(200)
      canvasBox = (await canvas.boundingBox())!
      expect(canvasBox.y).toBeGreaterThanOrEqual(headerBottom - 1)
      expect(canvasBox.y + canvasBox.height).toBeLessThanOrEqual(sheetTop + 1)
    })

    test('dragging the handle resizes the sheet and the publish button stays reachable', async ({ page }) => {
      await openEditorWithTemplate(page)
      const vh = page.viewportSize()!.height

      const handle = page.getByRole('button', { name: /חלונית הכלים/ })
      const grab = async () => {
        const hb = (await handle.boundingBox())!
        return { x: hb.x + hb.width / 2, y: hb.y + hb.height / 2 }
      }
      const sheetHeight = () => page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => (b.textContent ?? '').includes('פרסם גיחוך'))
        return btn!.closest('.fixed')!.getBoundingClientRect().height
      })

      // Drag far up → snaps to the tall state
      let from = await grab()
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move(from.x, from.y - vh * 0.55, { steps: 8 })
      await page.mouse.up()
      await page.waitForTimeout(500)
      expect(await sheetHeight(), 'sheet should snap tall after a big upward drag').toBeGreaterThanOrEqual(vh * 0.7)
      await expectFullyInViewport(page, publishButton(page), 'publish button (tall sheet)')
      await expectTappable(page, /פרסם גיחוך/, 'tall sheet')

      // Drag far down → snaps back to collapsed, publish still on-screen
      from = await grab()
      await page.mouse.move(from.x, from.y)
      await page.mouse.down()
      await page.mouse.move(from.x, from.y + vh * 0.6, { steps: 8 })
      await page.mouse.up()
      await page.waitForTimeout(500)
      expect(await sheetHeight(), 'sheet should snap collapsed after a big downward drag').toBeLessThanOrEqual(vh * 0.3)
      await expectFullyInViewport(page, publishButton(page), 'publish button (collapsed after drag)')
      await expectTappable(page, /פרסם גיחוך/, 'collapsed after drag')
    })

    test('layout viewport is not widened by horizontal overflow', async ({ page }) => {
      await openEditorWithTemplate(page)

      // Any element wider than the screen inflates the mobile layout viewport,
      // which drops position:fixed UI (the publish bar!) below the visible
      // area on iOS Safari. Regression test for the header overflow.
      const widths = await page.evaluate(() => ({
        innerWidth: window.innerWidth,
        scrollWidth: document.documentElement.scrollWidth
      }))
      expect(widths.innerWidth, 'layout viewport should match the device width').toBe(phone.viewport.width)
      expect(widths.scrollWidth, 'page should not overflow horizontally').toBeLessThanOrEqual(phone.viewport.width)
    })

    test('canvas stays interactive: tapping it selects/deselects without scrolling the page', async ({ page }) => {
      await openEditorWithTemplate(page)

      const canvas = page.locator('canvas').first()
      const before = await page.evaluate(() => window.scrollY)
      await canvas.tap()
      const after = await page.evaluate(() => window.scrollY)
      // touch-action: none on the Konva container — taps must not scroll.
      expect(after, 'tapping the canvas must not scroll the page').toBe(before)
    })
  })
}

test.describe('iPad 11" landscape (1194x834)', () => {
  test.use({ viewport: { width: 1194, height: 834 }, hasTouch: true })

  test('canvas does not overflow its editor card (iPad overflow regression)', async ({ page }) => {
    await openEditorWithTemplate(page)

    const canvas = page.locator('canvas').first()
    const canvasBox = (await canvas.boundingBox())!
    const cardBox = (await page.locator('.lg\\:col-span-3 > div').first().boundingBox())!

    expect(canvasBox.x).toBeGreaterThanOrEqual(cardBox.x)
    expect(canvasBox.x + canvasBox.width).toBeLessThanOrEqual(cardBox.x + cardBox.width + 1)
  })

  test('publish button is visible in the side panel', async ({ page }) => {
    await openEditorWithTemplate(page)
    await publishButton(page).scrollIntoViewIfNeeded()
    await expect(publishButton(page)).toBeVisible()
    await expectTappable(page, /פרסם גיחוך/, 'iPad side panel')
  })
})

test.describe('desktop (1440x900)', () => {
  test.use({ viewport: { width: 1440, height: 900 } })

  test('canvas and publish button are both visible', async ({ page }) => {
    await openEditorWithTemplate(page)

    await expect(page.locator('canvas').first()).toBeVisible()
    await publishButton(page).scrollIntoViewIfNeeded()
    await expect(publishButton(page)).toBeVisible()

    // Desktop keeps the tools panel static — tab content is always shown.
    const hiddenContent = await page.evaluate(() => {
      const panels = document.querySelector('.overflow-y-auto.scrollbar-thin')
      return panels ? window.getComputedStyle(panels).display === 'none' : true
    })
    expect(hiddenContent, 'tools panel content should be visible on desktop').toBe(false)
  })
})
