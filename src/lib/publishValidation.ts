/**
 * Client-side validation for meme publishing.
 *
 * Mirrors the create guards in firestore.rules for /memes — the server rejects
 * writes that exceed these limits with a generic English "Missing or
 * insufficient permissions" error (after the image was already uploaded).
 * Validating here first gives the user a clear message, before any
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

/**
 * A failure is reported as a key plus its interpolation values rather than a
 * finished sentence, so this module stays independent of any one language —
 * the caller resolves it against the active locale.
 */
export interface PublishValidationError {
  key: 'memeTextTooLong' | 'descriptionTooLong' | 'usernameTooLong' | 'tooManyTags'
  values: Record<string, number>
}

/** Returns the validation failure, or null if the data is valid. */
export function validateMemePublish(data: PublishData): PublishValidationError | null {
  if (data.memeText.length > PUBLISH_LIMITS.memeText) {
    return {
      key: 'memeTextTooLong',
      values: { count: data.memeText.length, limit: PUBLISH_LIMITS.memeText }
    }
  }
  if (data.description.length > PUBLISH_LIMITS.description) {
    return { key: 'descriptionTooLong', values: { limit: PUBLISH_LIMITS.description } }
  }
  if (data.username.length > PUBLISH_LIMITS.username) {
    return { key: 'usernameTooLong', values: { limit: PUBLISH_LIMITS.username } }
  }
  if (data.tags.length > PUBLISH_LIMITS.tags) {
    return { key: 'tooManyTags', values: { limit: PUBLISH_LIMITS.tags } }
  }
  return null
}
