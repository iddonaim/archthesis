/**
 * The suggested tag vocabulary offered in the editor.
 *
 * The Hebrew strings below are the *canonical values* — they are what gets
 * written to Firestore and what the gallery filter, the tag suggestions and
 * the admin analytics group on. They deliberately stay Hebrew in every
 * language: translating the stored value would split one tag into two
 * (a meme tagged "Architecture" would never match one tagged "אדריכלות"),
 * fragmenting both the gallery filter and the research data.
 *
 * Only the *label* shown to the user is translated — see `useTagLabel`.
 */
export const COMMON_TAGS = [
  'אדריכלות',
  'תכנון עירוני',
  'מרחב ציבורי',
  'בניה',
  'שיפוץ',
  'נוף עירוני',
  'תשתיות',
  'דיור',
  'גינון',
  'עיצוב',
  'היסטוריה',
  'מודרניזם',
] as const

/** Canonical tag value → key under the `tags` block of the common namespace. */
const TAG_KEYS: Record<string, string> = {
  'אדריכלות': 'architecture',
  'תכנון עירוני': 'urbanPlanning',
  'מרחב ציבורי': 'publicSpace',
  'בניה': 'construction',
  'שיפוץ': 'renovation',
  'נוף עירוני': 'urbanLandscape',
  'תשתיות': 'infrastructure',
  'דיור': 'housing',
  'גינון': 'landscaping',
  'עיצוב': 'design',
  'היסטוריה': 'history',
  'מודרניזם': 'modernism',
}

/**
 * Returns the translation key for a known tag, or undefined for tags the user
 * typed themselves — those are shown exactly as they were entered.
 */
export function tagTranslationKey(tag: string): string | undefined {
  return TAG_KEYS[tag]
}
