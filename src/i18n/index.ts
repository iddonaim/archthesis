import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import heCommon from './locales/he/common.json'
import heHome from './locales/he/home.json'
import enCommon from './locales/en/common.json'
import enHome from './locales/en/home.json'

export const SUPPORTED_LANGUAGES = ['he', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'he'

export const resources = {
  he: { common: heCommon, home: heHome },
  en: { common: enCommon, home: enHome },
} as const

/**
 * Keep the document direction and lang attribute in sync with the active
 * language. Hebrew is RTL, English is LTR. This is the single source of
 * truth for direction so every page reacts to a language switch.
 */
export function applyDirection(language: string) {
  const lang = (SUPPORTED_LANGUAGES as readonly string[]).includes(language)
    ? language
    : DEFAULT_LANGUAGE
  const dir = lang === 'he' ? 'rtl' : 'ltr'
  document.documentElement.lang = lang
  document.documentElement.dir = dir
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES as unknown as string[],
    // New visitors with no saved preference default to Hebrew (the project's
    // primary language). We intentionally do NOT detect the browser language.
    detection: {
      order: ['localStorage'],
      caches: ['localStorage'],
      lookupLocalStorage: 'language',
    },
    ns: ['common', 'home'],
    defaultNS: 'common',
    interpolation: {
      // React already escapes values, so i18next escaping is unnecessary.
      escapeValue: false,
    },
  })

// Apply the initial direction and react to every future language change.
applyDirection(i18n.language)
i18n.on('languageChanged', applyDirection)

export default i18n
