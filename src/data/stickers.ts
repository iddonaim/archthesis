/**
 * Curated sticker pack for the canvas editor.
 *
 * Every sticker is a self-contained inline SVG (data URI) — no network
 * fetches, no external hosting, works offline and never taints the canvas
 * on export. The SVGs declare a large intrinsic size (384px) so browsers
 * rasterize them crisply even when scaled up on the canvas.
 *
 * Palette matches the site design system: ink #20242E, coral #FF6B6B/#F04E4E,
 * accent #FFD166, blueprint blue #3B6EA5, paper #FAF8F5.
 */

export interface CuratedSticker {
  id: string
  /** Hebrew display name, shown as tooltip */
  label: string
  src: string
  /** width / height of the artwork. 1 = square. */
  aspect: number
}

const svg = (body: string, viewBox = '0 0 96 96', size = 384): string => {
  const [, , w, h] = viewBox.split(' ').map(Number)
  const height = Math.round((size * h) / w)
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${size}" height="${height}">${body}</svg>`
  )}`
}

const INK = '#20242E'
const TEXT_FONT = 'font-family="Heebo, Arial, sans-serif" font-weight="800"'

export const CURATED_STICKERS: CuratedSticker[] = [
  {
    id: 'speech-bubble',
    label: 'בועת דיבור',
    aspect: 1,
    src: svg(
      `<path d="M48 8C25 8 7 21 7 38c0 11 8 20 20 25l-7 24 26-16q1 .1 2 .1c23 0 41-14 41-33S71 8 48 8z" fill="#FAF8F5" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    )
  },
  {
    id: 'thought-bubble',
    label: 'בועת מחשבה',
    aspect: 1,
    src: svg(
      `<ellipse cx="52" cy="34" rx="36" ry="26" fill="#FAF8F5" stroke="${INK}" stroke-width="5"/>
       <circle cx="27" cy="70" r="7" fill="#FAF8F5" stroke="${INK}" stroke-width="4"/>
       <circle cx="16" cy="84" r="4" fill="#FAF8F5" stroke="${INK}" stroke-width="3"/>`
    )
  },
  {
    id: 'stamp-approved',
    label: 'חותמת אושר',
    aspect: 1,
    src: svg(
      `<g transform="rotate(-12 48 48)">
         <circle cx="48" cy="48" r="40" fill="none" stroke="#1E9E5A" stroke-width="6"/>
         <circle cx="48" cy="48" r="31" fill="none" stroke="#1E9E5A" stroke-width="2.5"/>
         <text x="48" y="57" text-anchor="middle" font-size="23" ${TEXT_FONT} fill="#1E9E5A">אושר</text>
       </g>`
    )
  },
  {
    id: 'stamp-rejected',
    label: 'חותמת נפסל',
    aspect: 1,
    src: svg(
      `<g transform="rotate(-10 48 48)">
         <rect x="8" y="29" width="80" height="38" rx="6" fill="none" stroke="#D93A3F" stroke-width="6"/>
         <text x="48" y="57" text-anchor="middle" font-size="24" ${TEXT_FONT} fill="#D93A3F">נפסל</text>
       </g>`
    )
  },
  {
    id: 'hard-hat',
    label: 'קסדת בנייה',
    aspect: 1,
    src: svg(
      `<rect x="40" y="16" width="16" height="16" rx="5" fill="#FFD166" stroke="${INK}" stroke-width="5"/>
       <path d="M16 62c0-20 14-35 32-35s32 15 32 35z" fill="#FFD166" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <rect x="7" y="60" width="82" height="13" rx="6.5" fill="#FFC94D" stroke="${INK}" stroke-width="5"/>`
    )
  },
  {
    id: 'blueprint',
    label: 'שרטוט',
    aspect: 1,
    src: svg(
      `<rect x="10" y="18" width="76" height="60" rx="4" fill="#3B6EA5" stroke="${INK}" stroke-width="5"/>
       <path d="M28 60V44l20-15 20 15v16z" fill="none" stroke="#FAF8F5" stroke-width="3" stroke-linejoin="round"/>
       <path d="M42 60V50h12v10" fill="none" stroke="#FAF8F5" stroke-width="2.5"/>
       <path d="M18 28h12M18 34h7M64 70h14M56 26h20" stroke="#FAF8F5" stroke-width="2" opacity=".55"/>`
    )
  },
  {
    id: 'set-square',
    label: 'משולשון',
    aspect: 1,
    src: svg(
      `<path d="M16 84V12l70 72z" fill="#FFD166" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <path d="M32 66V42l24 24z" fill="#FAF8F5" stroke="${INK}" stroke-width="3.5" stroke-linejoin="round"/>
       <path d="M16 26h7M16 36h7M16 46h7M16 56h7M16 66h7" stroke="${INK}" stroke-width="2.5"/>`
    )
  },
  {
    id: 'column',
    label: 'עמוד יווני',
    aspect: 1,
    src: svg(
      `<rect x="18" y="8" width="60" height="11" rx="2.5" fill="#EDE7DC" stroke="${INK}" stroke-width="4.5"/>
       <rect x="25" y="19" width="46" height="8" fill="#E3DCCE" stroke="${INK}" stroke-width="4"/>
       <rect x="31" y="27" width="34" height="42" fill="#F2EDE3" stroke="${INK}" stroke-width="4.5"/>
       <path d="M40 30v36M48 30v36M56 30v36" stroke="#C9C2B4" stroke-width="3"/>
       <rect x="25" y="69" width="46" height="8" fill="#E3DCCE" stroke="${INK}" stroke-width="4"/>
       <rect x="18" y="77" width="60" height="11" rx="2.5" fill="#EDE7DC" stroke="${INK}" stroke-width="4.5"/>`
    )
  },
  {
    id: 'crane',
    label: 'מנוף',
    aspect: 1,
    src: svg(
      `<path d="M31 10L14 24M31 10l44 14" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>
       <rect x="10" y="22" width="80" height="9" rx="2" fill="#FFD166" stroke="${INK}" stroke-width="4"/>
       <path d="M75 31v20" stroke="${INK}" stroke-width="3"/>
       <path d="M75 51c8 2 7 12-1 12" fill="none" stroke="${INK}" stroke-width="4.5" stroke-linecap="round"/>
       <rect x="26" y="31" width="11" height="53" fill="#FFD166" stroke="${INK}" stroke-width="4"/>
       <path d="M26 42l11 10M37 42l-11 10M26 62l11 10M37 62l-11 10" stroke="${INK}" stroke-width="2.5"/>
       <rect x="15" y="84" width="33" height="9" rx="2" fill="${INK}"/>`
    )
  },
  {
    id: 'wow-burst',
    label: 'וואו!',
    aspect: 1,
    src: svg(
      `<polygon points="48.0,3.0 55.3,15.8 67.5,7.5 68.6,22.2 83.2,19.9 77.7,33.7 91.9,38.0 81.0,48.0 91.9,58.0 77.7,62.3 83.2,76.1 68.6,73.8 67.5,88.5 55.3,80.2 48.0,93.0 40.7,80.2 28.5,88.5 27.4,73.8 12.8,76.1 18.3,62.3 4.1,58.0 15.0,48.0 4.1,38.0 18.3,33.7 12.8,19.9 27.4,22.2 28.5,7.5 40.7,15.8" fill="#FFD166" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/>
       <text x="48" y="56" text-anchor="middle" font-size="21" ${TEXT_FONT} fill="${INK}">וואו!</text>`
    )
  },
  {
    id: 'arrow',
    label: 'חץ',
    aspect: 1,
    src: svg(
      `<path d="M86 40v16H38v18L8 48l30-26v18z" fill="#F04E4E" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`
    )
  },
  {
    id: 'crown',
    label: 'כתר',
    aspect: 1,
    src: svg(
      `<path d="M16 68L8 26l22 14L48 12l18 28 22-14-8 42z" fill="#FFD166" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
       <rect x="14" y="68" width="68" height="13" rx="3.5" fill="#FFC94D" stroke="${INK}" stroke-width="5"/>
       <circle cx="48" cy="50" r="5.5" fill="#F04E4E" stroke="${INK}" stroke-width="3"/>`
    )
  },
  {
    id: 'cool-glasses',
    label: 'משקפי שמש',
    aspect: 2.5,
    src: svg(
      `<rect x="0" y="0" width="120" height="8" fill="${INK}"/>
       <rect x="10" y="8" width="38" height="12" fill="${INK}"/>
       <rect x="16" y="20" width="28" height="9" fill="${INK}"/>
       <rect x="22" y="29" width="17" height="7" fill="${INK}"/>
       <rect x="72" y="8" width="38" height="12" fill="${INK}"/>
       <rect x="78" y="20" width="28" height="9" fill="${INK}"/>
       <rect x="84" y="29" width="17" height="7" fill="${INK}"/>
       <rect x="48" y="8" width="24" height="6" fill="${INK}"/>`,
      '0 0 120 48',
      480
    )
  }
]
