import { useMemo } from 'react'
import Badge from '@/components/common/Badge'

interface FilterBarProps {
  selectedTags: string[]
  onTagToggle: (tag: string) => void
  onClearFilters: () => void
  memes: { tags: string[] }[]
}

export default function FilterBar({
  selectedTags,
  onTagToggle,
  onClearFilters,
  memes
}: FilterBarProps) {
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>()
    for (const meme of memes) {
      if (Array.isArray(meme.tags)) {
        for (const tag of meme.tags) {
          tagsSet.add(tag)
        }
      }
    }
    return Array.from(tagsSet).sort()
  }, [memes])

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
