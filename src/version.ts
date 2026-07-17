export const APP_VERSION = 'v3.4.0'
export const BUILD_DATE = new Date().toISOString().split('T')[0]

// Per-deploy build ID (git SHA), injected by Vite's `define` at build/dev time.
// Absent under vitest (no define step) — fall back to 'dev', which
// isNewBuildAvailable() treats as "build comparison unavailable".
export const APP_BUILD_ID =
  typeof __APP_BUILD_ID__ !== 'undefined' ? __APP_BUILD_ID__ : 'dev'
