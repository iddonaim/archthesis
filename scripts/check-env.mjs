#!/usr/bin/env node

/**
 * Build-time guard: fail the build if required Firebase environment variables
 * are missing or empty.
 *
 * Without this, a build produced without the VITE_FIREBASE_* vars succeeds and
 * deploys a bundle that throws `auth/invalid-api-key` at module load — i.e. a
 * silent white-screen outage. Catching it here turns that into a loud,
 * actionable build failure before anything ships.
 *
 * Uses Vite's loadEnv so it reads the exact same .env / .env.<mode> files the
 * build will use (matched on the build mode, defaulting to "production").
 */

import { loadEnv } from 'vite'

const REQUIRED = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
]

// Allow `--mode <name>`; default to production (Vite's default for `vite build`).
const modeFlagIndex = process.argv.indexOf('--mode')
const mode = modeFlagIndex !== -1 ? process.argv[modeFlagIndex + 1] : 'production'

// Third arg '' loads all vars (loadEnv only exposes VITE_* anyway by default,
// but our keys are VITE_-prefixed so the default prefix is fine).
const env = loadEnv(mode, process.cwd(), 'VITE_')

const missing = REQUIRED.filter((key) => !env[key] && !process.env[key])

if (missing.length > 0) {
  console.error('\n[31m✗ Build aborted: missing required environment variables[0m')
  console.error(`  Mode: ${mode}`)
  for (const key of missing) {
    console.error(`    - ${key}`)
  }
  console.error(
    '\n  Set these in a .env file (e.g. .env.production) or your build environment,\n' +
      '  then rebuild. See FIREBASE_SETUP_GUIDE.md for the expected values.\n'
  )
  process.exit(1)
}

console.log(`✅ Firebase env vars present (mode: ${mode})`)
