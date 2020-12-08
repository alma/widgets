import { DOMContent, integer } from '@/types'

export function priceToCents(price: number): integer {
  return Math.round(price * 100)
}

export function priceFromCents(cents: integer): number {
  return Number((cents / 100).toFixed(2))
}

export function formatCents(cents: integer): string {
  return String(priceFromCents(cents)).replace('.', ',')
}

export function isSameDate(date1: Date, date2: Date): boolean {
  return (
    date1.getUTCDate() === date2.getUTCDate() &&
    date1.getUTCMonth() === date2.getUTCMonth() &&
    date1.getUTCFullYear() === date2.getUTCFullYear()
  )
}

export function isToday(date: Date): boolean {
  return isSameDate(date, new Date())
}

export function isYesterday(date: Date): boolean {
  const today = new Date()
  return isSameDate(date, new Date(today.setDate(today.getDate() - 1)))
}

export function humanizedDate(date: Date, addArticle = false, forceDate = false): string {
  if (isToday(date) && !forceDate) {
    return "aujourd'hui"
  }

  if (isYesterday(date) && !forceDate) {
    return 'hier'
  }

  const article = addArticle ? 'le ' : ''
  return article + date.toLocaleDateString()
}
