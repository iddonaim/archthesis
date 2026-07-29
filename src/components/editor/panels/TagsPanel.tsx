import { useState } from 'react'
import { Tag, Plus, X } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useEditorStore } from '@/stores/useEditorStore'
import { useTagSuggestions } from '@/hooks/useTagSuggestions'
import { useTagLabel } from '@/hooks/useTagLabel'
import { COMMON_TAGS } from '@/lib/tagLabels'
import Badge from '@/components/common/Badge'
import Input from '@/components/common/Input'
import Button from '@/components/common/Button'

export default function TagsPanel() {
  const { selectedTags, addTag, removeTag } = useEditorStore()
  const [customTag, setCustomTag] = useState('')
  const [suggestions, setSuggestions] = useState<string[]>([])
  const { getSuggestions } = useTagSuggestions()
  const { t } = useTranslation('editor')
  const tagLabel = useTagLabel()

  const handleCustomTagChange = (value: string) => {
    setCustomTag(value)

    // Get suggestions when user types at least 2 characters
    if (value.length >= 2) {
      const suggested = getSuggestions(value, 5)
      setSuggestions(suggested)
    } else {
      setSuggestions([])
    }
  }

  const handleAddCustomTag = () => {
    if (!customTag.trim()) return
    if (selectedTags.length >= 3) {
      alert(t('tagsPanel.limitReached'))
      return
    }

    addTag(customTag.trim())
    setCustomTag('')
    setSuggestions([])
  }

  const handleSuggestionClick = (tag: string) => {
    if (selectedTags.length >= 3) {
      alert(t('tagsPanel.limitReached'))
      return
    }

    addTag(tag)
    setCustomTag('')
    setSuggestions([])
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Tag size={20} className="text-primary" />
        <h3 className="font-bold text-lg">{t('tagsPanel.title')}</h3>
      </div>

      {/* Selected Tags */}
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-2">
          {t('tagsPanel.selected', { count: selectedTags.length })}
        </p>
        {selectedTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedTags.map((tag) => (
              <Badge
                key={tag}
                variant="primary"
                className="flex items-center gap-1"
              >
                <span>{tagLabel(tag)}</span>
                <button
                  onClick={() => removeTag(tag)}
                  className="hover:text-white/80"
                >
                  <X size={14} />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            {t('tagsPanel.empty')}
          </p>
        )}
      </div>

      {/* Pre-defined Tags */}
      {selectedTags.length < 3 && (
        <div className="border-t pt-4">
          <p className="text-sm font-semibold text-gray-700 mb-2">{t('tagsPanel.common')}</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {COMMON_TAGS.filter(tag => !selectedTags.includes(tag)).map(tag => (
              <button
                key={tag}
                onClick={() => handleSuggestionClick(tag)}
                className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white rounded-full transition-colors"
              >
                {tagLabel(tag)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Tag */}
      {selectedTags.length < 3 && (
        <div className="space-y-2 border-t pt-4">
          <Input
            value={customTag}
            onChange={(e) => handleCustomTagChange(e.target.value)}
            placeholder={t('tagsPanel.customPlaceholder')}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomTag()
              }
            }}
          />

          {/* Dynamic Tag Suggestions */}
          {suggestions.length > 0 && (
            <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-lg">
              <p className="text-xs text-gray-600 mb-2 font-semibold">{t('tagsPanel.similar')}</p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleSuggestionClick(tag)}
                    className="text-sm px-3 py-1.5 bg-gray-100 hover:bg-primary hover:text-white rounded-full transition-colors"
                  >
                    {tagLabel(tag)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleAddCustomTag}
            className="w-full flex items-center justify-center gap-2"
            disabled={!customTag.trim()}
          >
            <Plus size={16} />
            <span>{t('tagsPanel.add')}</span>
          </Button>

          {/* Help text */}
          <p className="text-xs text-gray-500 text-center">
            {t('tagsPanel.hint')}
          </p>
        </div>
      )}
    </div>
  )
}
