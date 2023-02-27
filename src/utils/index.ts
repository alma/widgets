export function priceToCents(price: number): number {
  return Math.round(price * 100)
}

export function priceFromCents(cents: number): number {
  return Number((cents / 100).toFixed(2))
}

export function formatCents(cents: number): string {
  return String(priceFromCents(cents)).replace('.', ',')
}

export const secondsToMilliseconds = (date: number): number => date * 1000

export const desktopWidth = 800
