export const Locale = {
  en: 'en',
  'fr-FR': 'fr-FR',
  fr: 'fr',
  'de-DE': 'de-DE',
  de: 'de',
  it: 'it',
  'it-IT': 'it-IT',
  es: 'es',
  'es-ES': 'es-ES',
  pt: 'pt',
  'pt-PT': 'pt-PT',
  nl: 'nl',
  'nl-NL': 'nl-NL',
  'nl-BE': 'nl-BE',
} as const

// The value and its type share a name, like the enum they replace.
export type Locale = (typeof Locale)[keyof typeof Locale]
