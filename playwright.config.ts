import { defineConfig } from '@playwright/test'

/**
 * E2E layout tests for the meme editor (see e2e/).
 *
 * These run against the Vite dev server, which needs a .env file to exist —
 * placeholder values are fine (`cp .env.example .env`); the tests stub all
 * external network traffic (Firebase, template images) themselves.
 *
 * Run with: npm run test:e2e
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    // Point PW_CHROMIUM_PATH at a Chromium binary to skip the browser
    // download (e.g. sandboxed CI images with a pre-installed browser).
    launchOptions: process.env.PW_CHROMIUM_PATH
      ? { executablePath: process.env.PW_CHROMIUM_PATH }
      : {}
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000
  }
})
