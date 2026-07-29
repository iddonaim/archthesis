import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { tagTranslationKey } from '@/lib/tagLabels'

/**
 * Returns a formatter that turns a stored tag value into its display label.
 *
 * Tags from the suggested vocabulary are translated; custom tags a user typed
 * are passed through untouched, because there is nothing to translate them to.
 */
export function useTagLabel() {
  const { t } = useTranslation()

  return useCallback(
    (tag: string) => {
      const key = tagTranslationKey(tag)
      return key ? t(`tags.${key}`) : tag
    },
    [t]
  )
}
