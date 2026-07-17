/**
 * Client-side validation for meme publishing.
 *
 * Mirrors the create guards in firestore.rules for /memes — the server rejects
 * writes that exceed these limits with a generic English "Missing or
 * insufficient permissions" error (after the image was already uploaded).
 * Validating here first gives the user a clear Hebrew message, before any
 * upload happens.
 *
 * Keep these limits in sync with firestore.rules.
 */
export const PUBLISH_LIMITS = {
  memeText: 2000,
  description: 2000,
  username: 100,
  tags: 20
} as const

export interface PublishData {
  memeText: string
  description: string
  username: string
  tags: string[]
}

/** Returns a user-facing Hebrew error message, or null if the data is valid. */
export function validateMemePublish(data: PublishData): string | null {
  if (data.memeText.length > PUBLISH_LIMITS.memeText) {
    return `הטקסט בגיחוך ארוך מדי (${data.memeText.length.toLocaleString()} תווים) — המגבלה היא ${PUBLISH_LIMITS.memeText.toLocaleString()} תווים. נסו לקצר.`
  }
  if (data.description.length > PUBLISH_LIMITS.description) {
    return `התיאור ארוך מדי — המגבלה היא ${PUBLISH_LIMITS.description.toLocaleString()} תווים.`
  }
  if (data.username.length > PUBLISH_LIMITS.username) {
    return `שם המשתמש ארוך מדי — המגבלה היא ${PUBLISH_LIMITS.username} תווים.`
  }
  if (data.tags.length > PUBLISH_LIMITS.tags) {
    return `נבחרו יותר מדי תגיות — המגבלה היא ${PUBLISH_LIMITS.tags} תגיות.`
  }
  return null
}
