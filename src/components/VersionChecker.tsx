import { useEffect, useRef } from 'react'
import { APP_VERSION } from '@/version'

/**
 * VersionChecker - Automatically detects new deployments and forces refresh
 *
 * How it works:
 * 1. Polls /version.json every time the window gains focus
 * 2. Compares deployed version with current version
 * 3. If different, clears all caches and forces hard reload
 *
 * This ensures users always get the latest version without manual cache clearing
 */
export default function VersionChecker() {
  const currentVersion = useRef(APP_VERSION)
  const checkIntervalRef = useRef<number | null>(null)

  const checkVersion = async () => {
    try {
      // Add timestamp to prevent caching of version.json itself
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })

      if (!response.ok) {
        console.warn('Failed to fetch version.json')
        return
      }

      const data = await response.json()
      const deployedVersion = data.version

      console.log('Version check:', {
        current: currentVersion.current,
        deployed: deployedVersion
      })

      // If versions don't match, we have a new deployment
      if (deployedVersion !== currentVersion.current) {
        console.log('🔄 New version detected! Clearing caches and reloading...')

        // Clear all caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
          )
          console.log('✅ All caches cleared')
        }

        // Force hard reload
        window.location.reload()
      }
    } catch (error) {
      console.error('Version check failed:', error)
    }
  }

  useEffect(() => {
    console.log('🔍 VersionChecker mounted - current version:', currentVersion.current)

    // Check immediately on mount
    checkVersion()

    // Multiple strategies for detecting when to check (better mobile support)

    // 1. Window focus (desktop)
    const handleFocus = () => {
      console.log('📱 Window focused - checking for updates...')
      checkVersion()
    }

    // 2. Visibility change (mobile - fires when switching apps/tabs)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('👁️ Page visible - checking for updates...')
        checkVersion()
      }
    }

    // 3. Page show (fires on back button, mobile app return)
    const handlePageShow = (event: PageTransitionEvent) => {
      // If page was served from cache (back button)
      if (event.persisted) {
        console.log('🔙 Page from cache - checking for updates...')
        checkVersion()
      }
    }

    window.addEventListener('focus', handleFocus)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('pageshow', handlePageShow)

    // More aggressive polling for mobile (every 2 minutes instead of 5)
    checkIntervalRef.current = window.setInterval(() => {
      console.log('⏰ Periodic version check...')
      checkVersion()
    }, 2 * 60 * 1000) // 2 minutes

    return () => {
      window.removeEventListener('focus', handleFocus)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('pageshow', handlePageShow)
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
    }
  }, [])

  // This component doesn't render anything
  return null
}
