/**
 * Simple cache utility with TTL (Time To Live) support
 * Supports both memory cache and localStorage persistence
 */

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

class Cache {
  private memoryCache = new Map<string, CacheEntry<any>>()

  /**
   * Set a value in cache with TTL
   * @param key Cache key
   * @param data Data to cache
   * @param ttl Time to live in milliseconds (default: 5 minutes)
   * @param persist Whether to persist to localStorage (default: false)
   */
  set<T>(key: string, data: T, ttl: number = 5 * 60 * 1000, persist: boolean = false): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl
    }

    // Store in memory
    this.memoryCache.set(key, entry)

    // Optionally persist to localStorage
    if (persist) {
      try {
        localStorage.setItem(`cache:${key}`, JSON.stringify(entry))
      } catch (error) {
        console.warn('Failed to persist cache to localStorage:', error)
      }
    }
  }

  /**
   * Get a value from cache
   * @param key Cache key
   * @returns Cached data or null if expired/not found
   */
  get<T>(key: string): T | null {
    // Try memory cache first
    let entry = this.memoryCache.get(key)

    // If not in memory, try localStorage
    if (!entry) {
      try {
        const stored = localStorage.getItem(`cache:${key}`)
        if (stored) {
          entry = JSON.parse(stored)
          // Restore to memory cache
          if (entry) {
            this.memoryCache.set(key, entry)
          }
        }
      } catch (error) {
        console.warn('Failed to read cache from localStorage:', error)
      }
    }

    // Check if entry exists and is not expired
    if (entry) {
      const isExpired = Date.now() - entry.timestamp > entry.ttl

      if (isExpired) {
        this.delete(key)
        return null
      }

      return entry.data
    }

    return null
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Delete a cache entry
   */
  delete(key: string): void {
    this.memoryCache.delete(key)
    try {
      localStorage.removeItem(`cache:${key}`)
    } catch (error) {
      console.warn('Failed to remove cache from localStorage:', error)
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear()

    // Clear all cache entries from localStorage
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache:')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('Failed to clear cache from localStorage:', error)
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now()

    // Cleanup memory cache
    this.memoryCache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        this.delete(key)
      }
    })
  }
}

// Singleton instance
export const cache = new Cache()

// Run cleanup every 5 minutes
setInterval(() => cache.cleanup(), 5 * 60 * 1000)

// Image preloading utility
export const preloadImage = (url: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = reject
    img.src = url
  })
}

// Preload multiple images
export const preloadImages = async (urls: string[]): Promise<void> => {
  await Promise.all(urls.map(url => preloadImage(url).catch(() => {})))
}
