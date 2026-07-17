import { describe, it, expect } from 'vitest'
import { validateMemePublish, PUBLISH_LIMITS } from '@/lib/publishValidation'

/**
 * These limits mirror the create guards in firestore.rules — a payload that
 * passes here must not be rejected by the server for size reasons, and one
 * that fails here would have produced the cryptic English
 * "Missing or insufficient permissions" server error.
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
    expect(error).toMatch(/ארוך מדי/)
  })

  it('rejects an over-long description', () => {
    const error = validateMemePublish({ ...valid, description: 'א'.repeat(PUBLISH_LIMITS.description + 1) })
    expect(error).toMatch(/ארוך מדי/)
  })

  it('rejects an over-long username', () => {
    const error = validateMemePublish({ ...valid, username: 'א'.repeat(PUBLISH_LIMITS.username + 1) })
    expect(error).toMatch(/ארוך מדי/)
  })

  it('rejects too many tags', () => {
    const error = validateMemePublish({
      ...valid,
      tags: Array.from({ length: PUBLISH_LIMITS.tags + 1 }, (_, i) => `t${i}`)
    })
    expect(error).toMatch(/תגיות/)
  })
})
