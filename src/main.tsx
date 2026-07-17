import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './i18n'
import App from './App.tsx'

// Recover automatically when a deploy replaces the hashed chunk files while
// this tab is still running the previous build: lazy-loading a page then fails
// with "Failed to fetch dynamically imported module". Vite reports exactly
// this as 'vite:preloadError' — reload once to pick up the new build instead
// of showing the user a broken page. The sessionStorage timestamp guards
// against a reload loop if the failure persists (e.g. real network outage).
window.addEventListener('vite:preloadError', (event) => {
  const RELOAD_GUARD_KEY = 'chunk-reload-at'
  const lastReload = Number(sessionStorage.getItem(RELOAD_GUARD_KEY) || '0')
  if (Date.now() - lastReload > 30_000) {
    sessionStorage.setItem(RELOAD_GUARD_KEY, String(Date.now()))
    event.preventDefault()
    window.location.reload()
  }
})

// PWA/Service Worker DISABLED - no benefit for online-only app
// Unregister any existing service workers from previous PWA version
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister().then(() => {
        console.log('Old service worker unregistered')
      })
    }
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
