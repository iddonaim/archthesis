import { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import Badge from '@/components/common/Badge'

interface FilterBarProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
}

export default function FilterBar({
  selectedTags,
  onTagToggle,
  onClearFilters
}: FilterBarProps) {
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const memesSnapshot = await getDocs(collection(db, 'memes'))
        const tagsSet = new Set<string>()

        memesSnapshot.docs.forEach((doc) => {
          const meme = doc.data()
          if (meme.tags && Array.isArray(meme.tags)) {
            meme.tags.forEach((tag: string) => tagsSet.add(tag))
          }
        })

        setAvailableTags(Array.from(tagsSet).sort())
      } catch (error) {
        console.error('Error fetching tags:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTags()
  }, [])

  if (isLoading) {
    return (
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-8 w-20 bg-gray-200 rounded-full animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (availableTags.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">סינון לפי תגיות:</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:underline"
          >
            נקה הכל ({selectedTags.length})
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag)
          return (
            <button
              key={tag}
              onClick={() => onTagToggle(tag)}
              className="transition-transform hover:scale-105"
            >
              <Badge
                variant={isSelected ? 'primary' : 'secondary'}
                size="md"
                className="cursor-pointer"
              >
                {tag}
                {isSelected && ' ✓'}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
