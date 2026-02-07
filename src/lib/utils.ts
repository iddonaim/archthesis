import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function formatTimestamp(timestamp: Date): string {
  const now = new Date()
  const diff = now.getTime() - timestamp.getTime()
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 7) {
    return timestamp.toLocaleDateString('he-IL')
  } else if (days > 0) {
    return `לפני ${days} ימים`
  } else if (hours > 0) {
    return `לפני ${hours} שעות`
  } else if (minutes > 0) {
    return `לפני ${minutes} דקות`
  } else {
    return 'עכשיו'
  }
}

/**
 * Calculate contrast color (black or white) based on background luminance
 * Uses WCAG relative luminance formula for accessibility
 */
export function getContrastColor(bgColor: string): string {
  // Remove # if present
  const hex = bgColor.replace('#', '')

  // Parse RGB values
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255

  // Apply gamma correction (WCAG formula)
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

  // Calculate relative luminance
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear

  // Return black for light backgrounds, white for dark backgrounds
  return luminance > 0.5 ? '#000000' : '#FFFFFF'
}

/**
 * Calculate Levenshtein distance between two strings
 * Returns the minimum number of single-character edits needed to transform one string into another
 */
export function levenshtein(str1: string, str2: string): number {
  const matrix: number[][] = []

  // Initialize first column
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i]
  }

  // Initialize first row
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j
  }

  // Fill matrix
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        )
      }
    }
  }

  return matrix[str2.length][str1.length]
}

/**
 * Calculate similarity score between two strings (0 to 1)
 * Uses Levenshtein distance and substring matching
 */
export function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase()
  const s2 = str2.toLowerCase()

  // Exact match
  if (s1 === s2) return 1

  // One contains the other (high similarity)
  if (s1.includes(s2) || s2.includes(s1)) return 0.9

  // Calculate Levenshtein-based similarity
  const distance = levenshtein(s1, s2)
  const maxLen = Math.max(s1.length, s2.length)
  return 1 - (distance / maxLen)
}
