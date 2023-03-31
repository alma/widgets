import { EligibilityPlan } from '../types'

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

export const isP1X = (plan: EligibilityPlan): boolean =>
  plan?.installments_count === 1 && plan?.deferred_days === 0 && plan?.deferred_months === 0

export const isToday = (timestamp: number): boolean => {
  const today = new Date(Date.now()).setHours(0, 0, 0, 0)
  const dateToCompare = new Date(timestamp).setHours(0, 0, 0, 0)

  return today === dateToCompare
}
