import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import Badge from '@/components/common/Badge'
import { useTagLabel } from '@/hooks/useTagLabel'

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
  const { t } = useTranslation('gallery')
  const tagLabel = useTagLabel()
  const availableTags = useMemo(() => {
    const tagsSet = new Set<string>()
    for (const meme of memes) {
      if (Array.isArray(meme.tags)) {
        for (const tag of meme.tags) {
          tagsSet.add(tag)
        }
      }
    }
    // Sort by the label the user actually reads, not the stored Hebrew value,
    // so the chips stay alphabetical in whichever language is active.
    return Array.from(tagsSet).sort((a, b) => tagLabel(a).localeCompare(tagLabel(b)))
  }, [memes, tagLabel])

  if (availableTags.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">{t('filter.byTags')}</h3>
        {selectedTags.length > 0 && (
          <button
            onClick={onClearFilters}
            className="text-sm text-primary hover:underline"
          >
            {t('filter.clearAll', { count: selectedTags.length })}
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
                {tagLabel(tag)}
                {isSelected && ' ✓'}
              </Badge>
            </button>
          )
        })}
      </div>
    </div>
  )
}
