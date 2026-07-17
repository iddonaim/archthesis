/**
 * Single source of truth for the per-deploy build ID.
 *
 * Used by BOTH vite.config.ts (baked into the bundle via `define`) and
 * scripts/generate-version.mjs (written to dist/version.json), so the two
 * values are always computed identically. UpdateNotification compares them to
 * detect that a new build was deployed — even when the human-facing version
 * number (v3.4.0) didn't change, which is the common case: every merge to main
 * deploys and replaces all hashed chunk files, but the version is bumped only
 * occasionally. Comparing version numbers alone left the update banner blind
 * to most deploys while open tabs broke on stale chunk URLs.
 *
 * ESM on purpose: vite.config.ts imports this file and Vite bundles the config
 * to ESM, where a CommonJS `require('child_process')` cannot be inlined.
 */
import { execSync } from 'node:child_process'

export function getBuildId() {
  // CI: GitHub Actions always provides the commit SHA.
  if (process.env.GITHUB_SHA) {
    return process.env.GITHUB_SHA.slice(0, 12)
  }
  // Local builds: same value derived from git directly.
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim()
      .slice(0, 12)
  } catch {
    // No git available (e.g. a tarball build) — build change detection is
    // disabled rather than broken.
    return 'dev'
  }
}
