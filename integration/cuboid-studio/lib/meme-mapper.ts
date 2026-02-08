/**
 * Maps an archthesis meme to the input shape that cuboid-studio's
 * translateMeme API expects: { memeDescription, locationTag, engagementLevel }
 */

import type { ArchthesisMeme, CuboidMemeInput } from '../types/archthesis'

/**
 * Extract the text content from a meme, combining all available text fields.
 */
function extractMemeText(meme: ArchthesisMeme): string {
  const parts: string[] = []

  // Prefer the combined memeText field (newer memes)
  if (meme.memeText) {
    parts.push(meme.memeText)
  } else {
    // Fall back to legacy top/bottom text
    if (meme.topText) parts.push(meme.topText)
    if (meme.bottomText) parts.push(meme.bottomText)
  }

  // Append description if it adds context
  if (meme.description) {
    parts.push(meme.description)
  }

  // Append tags as context for the pataphysical translation
  if (meme.tags.length > 0) {
    parts.push(`[tags: ${meme.tags.join(', ')}]`)
  }

  return parts.join(' | ')
}

/**
 * Extract a location tag string from the meme's location field.
 * Handles both the legacy string format and the current object format.
 */
function extractLocationTag(meme: ArchthesisMeme): string {
  if (!meme.location) return 'unknown'

  if (typeof meme.location === 'string') {
    return meme.location
  }

  return meme.location.display_name || 'unknown'
}

/**
 * Map likes count to an engagement level (0-10 scale).
 * The pataphysical translation uses this to determine operator intensity.
 *
 * Mapping:
 *   0 likes       → 1  (minimal engagement, but still present)
 *   1-5 likes     → 3  (low)
 *   6-20 likes    → 5  (moderate)
 *   21-50 likes   → 7  (high)
 *   51-100 likes  → 9  (very high)
 *   100+ likes    → 10 (maximum)
 */
function mapEngagementLevel(likes: number): number {
  if (likes <= 0) return 1
  if (likes <= 5) return 3
  if (likes <= 20) return 5
  if (likes <= 50) return 7
  if (likes <= 100) return 9
  return 10
}

/**
 * Convert an archthesis meme to cuboid-studio's translateMeme input format.
 */
export function mapMemeToCuboidInput(meme: ArchthesisMeme): CuboidMemeInput {
  return {
    memeDescription: extractMemeText(meme),
    locationTag: extractLocationTag(meme),
    engagementLevel: mapEngagementLevel(meme.likes),
  }
}
