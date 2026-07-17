import { describe, it, expect } from 'vitest'
import { isNewBuildAvailable } from '@/lib/updateCheck'

/**
 * Pins the regression where the update banner never appeared for same-version
 * deploys: every merge to main replaces all hashed chunks, but the version
 * number rarely changes, so comparing versions alone missed nearly all deploys.
 */
describe('isNewBuildAvailable', () => {
  const local = { version: 'v3.4.0', buildId: 'aaaa11112222' }

  it('detects a new deploy with the SAME version but a different build ID', () => {
    expect(isNewBuildAvailable(local, { version: 'v3.4.0', buildId: 'bbbb33334444' })).toBe(true)
  })

  it('reports no update when build IDs match', () => {
    expect(isNewBuildAvailable(local, { version: 'v3.4.0', buildId: 'aaaa11112222' })).toBe(false)
  })

  it('falls back to version comparison when remote has no buildId (old version.json)', () => {
    expect(isNewBuildAvailable(local, { version: 'v3.5.0' })).toBe(true)
    expect(isNewBuildAvailable(local, { version: 'v3.4.0' })).toBe(false)
  })

  it('falls back to version comparison when the local bundle has no real buildId', () => {
    const devLocal = { version: 'v3.4.0', buildId: 'dev' }
    expect(isNewBuildAvailable(devLocal, { version: 'v3.5.0', buildId: 'bbbb33334444' })).toBe(true)
    expect(isNewBuildAvailable(devLocal, { version: 'v3.4.0', buildId: 'bbbb33334444' })).toBe(false)
  })

  it('reports no update when remote info is missing or empty', () => {
    expect(isNewBuildAvailable(local, null)).toBe(false)
    expect(isNewBuildAvailable(local, undefined)).toBe(false)
    expect(isNewBuildAvailable(local, {})).toBe(false)
  })
})
