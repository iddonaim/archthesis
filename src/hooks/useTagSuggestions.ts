import { useState, useEffect, useMemo } from 'react'
import { useMemeStore } from '@/stores/useMemeStore'
import { calculateSimilarity } from '@/lib/utils'

/**
 * Hook for suggesting tags based on similarity to user input
 * Uses Levenshtein distance and tag frequency
 */
export function useTagSuggestions() {
  const { memes } = useMemeStore()
  const [allTags, setAllTags] = useState<Map<string, number>>(new Map())

  // Build tag frequency map from all memes
  useEffect(() => {
    const tagMap = new Map<string, number>()
    memes.forEach(meme => {
      meme.tags.forEach(tag => {
        tagMap.set(tag, (tagMap.get(tag) || 0) + 1)
      })
    })
    setAllTags(tagMap)
  }, [memes])

  // Get suggestions for a given input
  const getSuggestions = useMemo(() => {
    return (input: string, limit = 5): string[] => {
      if (input.length < 2) return []

      return Array.from(allTags.entries())
        .map(([tag, count]) => ({
          tag,
          count,
          similarity: calculateSimilarity(input, tag)
        }))
        .filter(item => item.similarity > 0.5) // Only show reasonably similar tags
        .sort((a, b) => {
          // Prioritize similarity, but break ties with frequency
          if (Math.abs(a.similarity - b.similarity) > 0.1) {
            return b.similarity - a.similarity
          }
          return b.count - a.count
        })
        .slice(0, limit)
        .map(item => item.tag)
    }
  }, [allTags])

  return { getSuggestions }
}
