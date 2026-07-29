import { describe, it, expect } from 'vitest'
import { resources, SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE } from '@/i18n'

type Json = string | number | boolean | null | Json[] | { [key: string]: Json }

/**
 * Flattens a locale bundle to dotted key paths, so two languages can be
 * compared by structure rather than by content. Arrays are indexed, which
 * catches a translated list that gained or lost an entry.
 */
function keyPaths(value: Json, prefix = ''): string[] {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => keyPaths(item, `${prefix}[${index}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      keyPaths(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return [prefix]
}

/** Every `{{placeholder}}` a string interpolates. */
function placeholders(value: string): string[] {
  return (value.match(/\{\{\s*[\w.]+\s*\}\}/g) ?? []).map(p => p.replace(/[{}\s]/g, '')).sort()
}

function flatStrings(value: Json, prefix = ''): Array<[string, string]> {
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flatStrings(item, `${prefix}[${index}]`))
  }
  if (value !== null && typeof value === 'object') {
    return Object.entries(value).flatMap(([key, child]) =>
      flatStrings(child, prefix ? `${prefix}.${key}` : key)
    )
  }
  return typeof value === 'string' ? [[prefix, value]] : []
}

const namespaces = Object.keys(resources[DEFAULT_LANGUAGE]) as Array<
  keyof (typeof resources)['he']
>

describe('locale bundles', () => {
  it('ships the same namespaces for every language', () => {
    for (const language of SUPPORTED_LANGUAGES) {
      expect(Object.keys(resources[language]).sort()).toEqual([...namespaces].sort())
    }
  })

  describe.each(namespaces)('%s namespace', (namespace) => {
    it('has identical key structure in Hebrew and English', () => {
      const he = keyPaths(resources.he[namespace] as Json).sort()
      const en = keyPaths(resources.en[namespace] as Json).sort()

      // Reported as set differences so a failure names the offending keys
      // instead of dumping both bundles.
      expect(en.filter(k => !he.includes(k))).toEqual([])
      expect(he.filter(k => !en.includes(k))).toEqual([])
    })

    it('uses the same interpolation placeholders in both languages', () => {
      const he = new Map(flatStrings(resources.he[namespace] as Json))
      const en = new Map(flatStrings(resources.en[namespace] as Json))

      const mismatched = [...he.entries()]
        .filter(([key, value]) => {
          const other = en.get(key)
          return other !== undefined && placeholders(value).join() !== placeholders(other).join()
        })
        .map(([key]) => key)

      expect(mismatched).toEqual([])
    })

    it('has no empty strings', () => {
      for (const language of SUPPORTED_LANGUAGES) {
        const empty = flatStrings(resources[language][namespace] as Json)
          .filter(([, value]) => value.trim() === '')
          .map(([key]) => key)
        expect(empty).toEqual([])
      }
    })
  })
})
