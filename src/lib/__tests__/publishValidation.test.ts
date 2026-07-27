import { describe, it, expect } from 'vitest'
import { validateMemePublish, PUBLISH_LIMITS } from '@/lib/publishValidation'
import i18n from '@/i18n'

/**
 * These limits mirror the create guards in firestore.rules — a payload that
 * passes here must not be rejected by the server for size reasons, and one
 * that fails here would have produced the cryptic English
 * "Missing or insufficient permissions" server error.
 *
 * The validator reports a translation key rather than a sentence, so the
 * assertions below check the key and its interpolation values.
 */
describe('validateMemePublish', () => {
  const valid = {
    memeText: 'טקסט לדוגמה',
    description: 'תיאור',
    username: 'משתמש',
    tags: ['tag1', 'tag2']
  }

  it('accepts a typical meme', () => {
    expect(validateMemePublish(valid)).toBeNull()
  })

  it('accepts empty optional fields', () => {
    expect(validateMemePublish({ memeText: '', description: '', username: '', tags: [] })).toBeNull()
  })

  it('accepts values exactly at the limits', () => {
    expect(
      validateMemePublish({
        memeText: 'א'.repeat(PUBLISH_LIMITS.memeText),
        description: 'ב'.repeat(PUBLISH_LIMITS.description),
        username: 'ג'.repeat(PUBLISH_LIMITS.username),
        tags: Array.from({ length: PUBLISH_LIMITS.tags }, (_, i) => `t${i}`)
      })
    ).toBeNull()
  })

  it('rejects meme text over the firestore.rules limit', () => {
    const error = validateMemePublish({ ...valid, memeText: 'א'.repeat(PUBLISH_LIMITS.memeText + 1) })
    expect(error).toEqual({
      key: 'memeTextTooLong',
      values: { count: PUBLISH_LIMITS.memeText + 1, limit: PUBLISH_LIMITS.memeText }
    })
  })

  it('rejects an over-long description', () => {
    const error = validateMemePublish({ ...valid, description: 'א'.repeat(PUBLISH_LIMITS.description + 1) })
    expect(error).toEqual({ key: 'descriptionTooLong', values: { limit: PUBLISH_LIMITS.description } })
  })

  it('rejects an over-long username', () => {
    const error = validateMemePublish({ ...valid, username: 'א'.repeat(PUBLISH_LIMITS.username + 1) })
    expect(error).toEqual({ key: 'usernameTooLong', values: { limit: PUBLISH_LIMITS.username } })
  })

  it('rejects too many tags', () => {
    const error = validateMemePublish({
      ...valid,
      tags: Array.from({ length: PUBLISH_LIMITS.tags + 1 }, (_, i) => `t${i}`)
    })
    expect(error).toEqual({ key: 'tooManyTags', values: { limit: PUBLISH_LIMITS.tags } })
  })

  it('reports failures the editor can actually render', () => {
    const error = validateMemePublish({ ...valid, memeText: 'א'.repeat(PUBLISH_LIMITS.memeText + 1) })
    expect(error).not.toBeNull()
    // Every failure key must exist in both languages, otherwise the publish
    // toast would show the raw key instead of a message.
    for (const language of ['he', 'en']) {
      expect(i18n.exists(`publish.validation.${error!.key}`, { ns: 'editor', lng: language })).toBe(true)
    }
  })
})
