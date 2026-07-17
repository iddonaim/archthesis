#!/usr/bin/env node

/**
 * Generates version.json file during build
 * This file is used by UpdateNotification to detect when a new version is deployed
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getBuildId } from './build-id.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
)

// Also read our custom version if it exists
let appVersion = packageJson.version
try {
  const versionModule = fs.readFileSync(
    path.join(__dirname, '../src/version.ts'),
    'utf-8'
  )
  const versionMatch = versionModule.match(/APP_VERSION = ['"](.+?)['"]/)
  if (versionMatch) {
    appVersion = versionMatch[1]
  }
} catch {
  // If version.ts doesn't exist, fallback to package.json
  console.log('Using package.json version:', appVersion)
}

const versionData = {
  version: appVersion,
  // Same value vite.config.ts bakes into the bundle as __APP_BUILD_ID__ —
  // UpdateNotification compares the two to detect same-version deploys.
  buildId: getBuildId(),
  buildTime: new Date().toISOString()
}

// Write to dist/version.json (created after build)
const distPath = path.join(__dirname, '../dist/version.json')
fs.writeFileSync(distPath, JSON.stringify(versionData, null, 2))

console.log(`✅ Generated version.json with version: ${appVersion} (build ${versionData.buildId})`)
