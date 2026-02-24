import type { ConfigPlan, EligibilityPlan } from '../types'

/**
 * Returns true if the plan is a "pay now" plan: 1 installment, no deferral.
 * P1X is excluded from the widget by default unless explicitly configured.
 */
export function isPayNowPlan(plan: EligibilityPlan): boolean {
  return (
    plan.installments_count === 1 &&
    (plan.deferred_days ?? 0) === 0 &&
    (plan.deferred_months ?? 0) === 0
  )
}

/**
 * Returns true if the P1X (pay now) plan is explicitly listed in the merchant's
 * configPlans, meaning it should be shown in the widget.
 */
export function isPayNowExplicitlyConfigured(configPlans?: ConfigPlan[]): boolean {
  return (
    configPlans?.some(
      (p) => p.installmentsCount === 1 && !p.deferredDays && !p.deferredMonths,
    ) ?? false
  )
}

/**
 * Sort plans by installment count (ascending), then by total deferral duration (ascending).
 * Returns a new array — does not mutate the input.
 */
export function sortPlans(plans: EligibilityPlan[]): EligibilityPlan[] {
  return [...plans].sort((a, b) => {
    if (a.installments_count !== b.installments_count) {
      return a.installments_count - b.installments_count
    }
    const aDeferral = (a.deferred_months ?? 0) * 30 + (a.deferred_days ?? 0)
    const bDeferral = (b.deferred_months ?? 0) * 30 + (b.deferred_days ?? 0)
    return aDeferral - bDeferral
  })
}
