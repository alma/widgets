import type { EligibilityPlan } from '../types'
import { t } from '../i18n'

/**
 * Get button text for a plan (handles deferred payments)
 */
export function getPlanButtonText(plan: EligibilityPlan, locale: string = 'fr'): string {
  const { installments_count, deferred_days, deferred_months } = plan
  const lang = (locale.split('-')[0] as any) || 'fr'

  // Pay now (1x with no deferral)
  if (installments_count === 1 && !deferred_days && !deferred_months) {
    return t(lang, 'paymentPlans.payNow')
  }

  // Deferred by days (e.g., J+30 for French, D+30 for others)
  if (installments_count === 1 && deferred_days) {
    const dayPrefix = lang === 'fr' ? 'J' : 'D'
    return `${dayPrefix}+${deferred_days}`
  }

  // Deferred by months (e.g., M+2)
  if (installments_count === 1 && deferred_months) {
    return `M+${deferred_months}`
  }

  // Regular installments (e.g., 3x, 4x)
  return `${installments_count}x`
}
