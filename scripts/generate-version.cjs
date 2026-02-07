#!/usr/bin/env node

/**
 * Generates version.json file during build
 * This file is used by VersionChecker to detect when a new version is deployed
 */

const fs = require('fs');
const path = require('path');

// Read version from package.json
const packageJson = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8')
);

// Also read our custom version if it exists
let appVersion = packageJson.version;
try {
  const versionModule = fs.readFileSync(
    path.join(__dirname, '../src/version.ts'),
    'utf-8'
  );
  const versionMatch = versionModule.match(/APP_VERSION = ['"](.+?)['"]/);
  if (versionMatch) {
    appVersion = versionMatch[1];
  }
} catch (err) {
  // If version.ts doesn't exist, fallback to package.json
  console.log('Using package.json version:', appVersion);
}

const versionData = {
  version: appVersion,
  buildTime: new Date().toISOString()
};

// Write to dist/version.json (created after build)
const distPath = path.join(__dirname, '../dist/version.json');
fs.writeFileSync(distPath, JSON.stringify(versionData, null, 2));

console.log(`✅ Generated version.json with version: ${appVersion}`);
