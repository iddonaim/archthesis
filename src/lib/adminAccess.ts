/**
 * Admin authorization for the console gate.
 *
 * Authentication (email + password) only proves *who* a visitor is. Admin
 * access is a separate authorization decision, resolved here so the frontend
 * gate and the backend security rules can agree on it.
 *
 * Two independent signals grant admin, so the console keeps working even if one
 * is misconfigured:
 *
 *   1. The Firebase custom claim `admin: true` — the SAME source of truth the
 *      Firestore/Storage security rules already enforce (see firestore.rules).
 *      This is the robust, backend-aligned path and needs no build-time config.
 *   2. A match against the `VITE_ADMIN_EMAIL` build-time env var — the legacy
 *      email allow-list. Only consulted when that var is actually set, so an
 *      unset/undefined var can never accidentally match (this was the bug that
 *      locked the owner out: the var never reached the production build, so the
 *      old `email === undefined` check failed for everyone).
 */
export function resolveIsAdmin(
  user: { email: string | null } | null,
  claims: Record<string, unknown> | null
): boolean {
  if (!user) return false

  // Backend-aligned: custom claim set via the Firebase Admin SDK.
  if (claims?.admin === true) return true

  // Legacy email allow-list — only when VITE_ADMIN_EMAIL is a non-empty string.
  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL
  if (adminEmail && user.email === adminEmail) return true

  return false
}
