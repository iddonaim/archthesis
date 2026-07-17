import { describe, it, expect, afterEach, vi } from 'vitest'
import { resolveIsAdmin } from '@/lib/adminAccess'

/**
 * `resolveIsAdmin` is the single decision point for the admin console gate.
 * These cases pin down the regression that locked the owner out: an unset
 * `VITE_ADMIN_EMAIL` must never grant (or deny) admin by accident, and the
 * Firebase custom claim must work on its own.
 */
describe('resolveIsAdmin', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('denies when there is no user', () => {
    vi.stubEnv('VITE_ADMIN_EMAIL', 'owner@example.com')
    expect(resolveIsAdmin(null, null)).toBe(false)
    expect(resolveIsAdmin(null, { admin: true })).toBe(false)
  })

  it('grants when the user carries the admin custom claim', () => {
    // No email env configured at all — the claim alone is enough.
    vi.stubEnv('VITE_ADMIN_EMAIL', '')
    expect(resolveIsAdmin({ email: 'anyone@example.com' }, { admin: true })).toBe(true)
  })

  it('grants when the email matches the configured admin email', () => {
    vi.stubEnv('VITE_ADMIN_EMAIL', 'owner@example.com')
    expect(resolveIsAdmin({ email: 'owner@example.com' }, null)).toBe(true)
  })

  it('denies a non-admin email when there is no claim', () => {
    vi.stubEnv('VITE_ADMIN_EMAIL', 'owner@example.com')
    expect(resolveIsAdmin({ email: 'stranger@example.com' }, { admin: false })).toBe(false)
  })

  it('does NOT grant admin when VITE_ADMIN_EMAIL is unset (the outage bug)', () => {
    // Reproduces the production build where the var was never injected: an
    // undefined admin email must not match a user whose email is undefined,
    // and must not throw.
    vi.stubEnv('VITE_ADMIN_EMAIL', '')
    expect(resolveIsAdmin({ email: null }, null)).toBe(false)
    expect(resolveIsAdmin({ email: 'owner@example.com' }, null)).toBe(false)
  })

  it('treats a non-true claim value as not admin', () => {
    vi.stubEnv('VITE_ADMIN_EMAIL', '')
    expect(resolveIsAdmin({ email: 'a@b.com' }, { admin: 'true' })).toBe(false)
    expect(resolveIsAdmin({ email: 'a@b.com' }, { admin: 1 })).toBe(false)
  })
})
