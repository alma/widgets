/**
 * Format cents to display price
 */
export function formatPrice(cents: number, locale: string = 'fr'): string {
  const amount = cents / 100

  const currencyMap: Record<string, string> = {
    en: 'EUR',
    fr: 'EUR',
    'fr-FR': 'EUR',
    de: 'EUR',
    'de-DE': 'EUR',
    it: 'EUR',
    'it-IT': 'EUR',
    es: 'EUR',
    'es-ES': 'EUR',
    pt: 'EUR',
    'pt-PT': 'EUR',
    nl: 'EUR',
    'nl-NL': 'EUR',
    'nl-BE': 'EUR',
  }

  const currency = currencyMap[locale] || 'EUR'

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount)
}

