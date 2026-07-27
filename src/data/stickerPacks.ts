/**
 * Sticker packs for the editor's sticker tab — organized like a mobile
 * keyboard's sticker packs: a pack switcher row, one grid per pack.
 *
 * - "meme" and "props" use vendored Twemoji artwork (CC-BY 4.0, see
 *   src/assets/stickers/LICENSE.md) imported as hashed asset URLs.
 * - "hebrew" is a set of bold Hebrew text badges generated as inline SVG.
 * - "tools" is the original hand-drawn architecture pack from stickers.ts.
 *
 * The user's personal library ("my stickers") is not a static pack — it
 * lives in localStorage, see src/lib/userStickers.ts.
 */

import { CURATED_STICKERS, type CuratedSticker } from './stickers'

export interface StickerDef {
  id: string
  /** Translation key for the tooltip + alt text, resolved in the panel. */
  labelKey: string
  src: string
  /** width / height of the artwork */
  aspect: number
}

export interface StickerPack {
  id: string
  labelKey: string
  /** Emoji shown on the pack-switcher button */
  icon: string
  stickers: StickerDef[]
}

// Vite turns these into hashed asset URLs at build time (same-origin, so
// they never taint the canvas on export).
const twemojiFiles = import.meta.glob('/src/assets/stickers/*/*.svg', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const twemoji = (dir: 'meme' | 'props', code: string, labelKey: string): StickerDef | null => {
  const src = twemojiFiles[`/src/assets/stickers/${dir}/${code}.svg`]
  if (!src) return null
  return { id: `${dir}-${code}`, labelKey, src, aspect: 1 }
}

const buildPack = (
  dir: 'meme' | 'props',
  entries: Array<[code: string, labelKey: string]>
): StickerDef[] =>
  entries
    .map(([code, labelKey]) => twemoji(dir, code, `stickers.${dir}.${labelKey}`))
    .filter((s): s is StickerDef => s !== null)

const MEME_STICKERS = buildPack('meme', [
  ['1f602', 'cryingLaughing'],
  ['1f62d', 'sobbing'],
  ['1f979', 'holdingBackTears'],
  ['1f480', 'skull'],
  ['1f5ff', 'moai'],
  ['1f525', 'fire'],
  ['1f4af', 'hundred'],
  ['1f921', 'clown'],
  ['1f972', 'smilingWithTear'],
  ['1f440', 'eyes'],
  ['1f64f', 'foldedHands'],
  ['1f60e', 'cool'],
  ['1f485', 'nailPolish'],
  ['1fae1', 'salute'],
  ['1f913', 'nerd'],
  ['1f92f', 'explodingHead'],
  ['1f37f', 'popcorn'],
  ['1f4a9', 'poop'],
  ['2764-fe0f-200d-1f525', 'heartOnFire'],
  ['1f624', 'steaming'],
])

const PROP_STICKERS = buildPack('props', [
  ['1f576', 'sunglasses'],
  ['1f453', 'glasses'],
  ['1f451', 'crown'],
  ['1f3a9', 'topHat'],
  ['1f9e2', 'cap'],
  ['1f978', 'disguise'],
  ['1f4a5', 'boom'],
  ['1f4a2', 'anger'],
  ['1f389', 'party'],
  ['2728', 'sparkles'],
  ['1f4ac', 'speechBalloon'],
  ['1f3c6', 'trophy'],
])

// --- Hebrew text badges -----------------------------------------------------

const badgeSvg = (text: string, fill: string, textFill: string, width: number): string => {
  const H = 64
  const body = `<g transform="rotate(-4 ${width / 2} ${H / 2})">
    <rect x="2" y="8" width="${width - 4}" height="48" rx="16" fill="#FFFFFF"/>
    <rect x="7" y="13" width="${width - 14}" height="38" rx="11" fill="${fill}"/>
    <text x="${width / 2}" y="40" text-anchor="middle" font-size="24" font-weight="900" font-family="Heebo, Arial, sans-serif" fill="${textFill}">${text}</text>
  </g>`
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${H}" width="${width * 5}" height="${H * 5}">${body}</svg>`
  )}`
}

/**
 * The badge text is artwork, not UI: these stickers say something in Hebrew
 * slang, and that is the point of the pack. Their tooltips therefore resolve
 * to the same Hebrew wording in both languages — the key exists only so the
 * panel can treat every sticker uniformly.
 */
const badge = (id: string, text: string, fill: string, textFill = '#FFFFFF'): StickerDef => {
  // Rough width estimate for bold Hebrew at font-size 24
  const width = Math.max(96, Math.round(text.length * 15 + 44))
  return {
    id: `badge-${id}`,
    labelKey: `stickers.hebrew.${id}`,
    src: badgeSvg(text, fill, textFill, width),
    aspect: width / 64,
  }
}

const HEBREW_BADGES: StickerDef[] = [
  badge('walla', 'וואלה', '#4ECDC4'),
  badge('sababa', 'סבבה', '#2EB872'),
  badge('einmatzav', 'אין מצב', '#8C52FF'),
  badge('dai', '!!די', '#FF5757'),
  badge('haval', 'חבל על הזמן', '#FF9A3D'),
  badge('kapara', 'כפרה', '#FF66A3'),
  badge('mehamem', 'מהמם', '#FFD166', '#20242E'),
  badge('lonormali', 'לא נורמלי', '#3D8BFF'),
]

// --- The original hand-drawn pack (kept as its own pack) ---------------------

const TOOL_STICKERS: StickerDef[] = CURATED_STICKERS.map((s: CuratedSticker) => ({
  id: s.id,
  labelKey: s.labelKey,
  src: s.src,
  aspect: s.aspect,
}))

export const STICKER_PACKS: StickerPack[] = [
  { id: 'meme', labelKey: 'stickers.packs.meme', icon: '💀', stickers: MEME_STICKERS },
  { id: 'props', labelKey: 'stickers.packs.props', icon: '🕶️', stickers: PROP_STICKERS },
  { id: 'hebrew', labelKey: 'stickers.packs.hebrew', icon: '🗯️', stickers: HEBREW_BADGES },
  { id: 'tools', labelKey: 'stickers.packs.tools', icon: '📐', stickers: TOOL_STICKERS },
]
