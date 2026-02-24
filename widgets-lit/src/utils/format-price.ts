/**
 * Format cents to display price
 */
export function formatPrice(cents: number, locale: string = 'fr'): string {
  const amount = cents / 100

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'EUR',
  }).format(amount)
}
