import { useState, useEffect } from 'react'
import { APP_VERSION } from '@/version'
import Button from './common/Button'
import { RefreshCw } from 'lucide-react'

/**
 * UpdateNotification - Shows a visible banner when new version is available
 * Includes manual refresh button for iOS/mobile users
 */
export default function UpdateNotification() {
  const [hasUpdate, setHasUpdate] = useState(false)
  const [isChecking, setIsChecking] = useState(false)

  const checkVersion = async () => {
    setIsChecking(true)
    try {
      const response = await fetch(`/version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('✅ Version check:', { current: APP_VERSION, deployed: data.version })

        if (data.version !== APP_VERSION) {
          setHasUpdate(true)
        }
      }
    } catch (error) {
      console.error('Version check failed:', error)
    } finally {
      setIsChecking(false)
    }
  }

  const handleRefresh = async () => {
    console.log('🔄 Manual refresh triggered')

    // Clear all caches
    if ('caches' in window) {
      const cacheNames = await caches.keys()
      await Promise.all(cacheNames.map(name => caches.delete(name)))
    }

    // Force reload
    window.location.reload()
  }

  useEffect(() => {
    // Check on mount
    checkVersion()

    // Check every 30 seconds (aggressive for testing)
    const interval = setInterval(checkVersion, 30 * 1000)

    // Check on visibility change (iOS)
    const handleVisibility = () => {
      if (!document.hidden) checkVersion()
    }
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [])

  // Don't render anything if no update
  if (!hasUpdate) {
    return (
      <div className="fixed bottom-4 left-4 text-xs text-gray-400 bg-white px-2 py-1 rounded shadow">
        {APP_VERSION}
      </div>
    )
  }

  // Show prominent update banner
  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-gradient-to-r from-primary to-secondary p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between gap-4 flex-wrap">
        <div className="text-white">
          <p className="font-bold">🎉 גרסה חדשה זמינה!</p>
          <p className="text-sm opacity-90">לחץ לטעינה מחדש</p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="bg-white text-primary hover:bg-gray-100 flex items-center gap-2"
          disabled={isChecking}
        >
          <RefreshCw size={18} className={isChecking ? 'animate-spin' : ''} />
          רענן עכשיו
        </Button>
      </div>
    </div>
  )
}
