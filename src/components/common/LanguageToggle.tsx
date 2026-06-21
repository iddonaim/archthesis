import { useTranslation } from 'react-i18next'
import { Languages } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LanguageToggleProps {
  className?: string
}

/**
 * Toggles the UI language between Hebrew and English. The button label always
 * shows the language you'll switch TO (e.g. "English" while viewing Hebrew).
 * The active language is persisted to localStorage by i18next.
 */
export default function LanguageToggle({ className }: LanguageToggleProps) {
  const { t, i18n } = useTranslation()

  const nextLanguage = i18n.language === 'he' ? 'en' : 'he'

  const handleToggle = () => {
    i18n.changeLanguage(nextLanguage)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={t('language.label')}
      title={t('language.switchTo')}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg font-semibold text-gray-600 hover:bg-gray-100 transition-colors',
        className
      )}
    >
      <Languages className="h-5 w-5" />
      <span className="hidden sm:inline">{t('language.switchTo')}</span>
    </button>
  )
}
