import { ConfigPlan, EligibilityPlan } from '@/types'
import { eligiblePlanBuilder, ineligiblePlanBuilder } from './planBuilders'

const baseEligiblePlan = eligiblePlanBuilder().withPurchaseAmount(45000)

export const mockP1XEligiblePlan = baseEligiblePlan.withInstallmentsCount(1)

export const mockPayLaterOneMonthEligiblePlan = baseEligiblePlan
  .withInstallmentsCount(1)
  .withDeferredMonths(1)

export const mockPayLater30DaysEligiblePlan = baseEligiblePlan
  .withInstallmentsCount(1)
  .withDeferredDays(30)

export const mockP2XEligiblePlan = baseEligiblePlan.withInstallmentsCount(2)

export const mockP3XEligiblePlanWithFees = baseEligiblePlan.withInstallmentsCount(3).withFees(135)

export const mockP4XEligiblePlanWithFees = baseEligiblePlan.withInstallmentsCount(4).withFees(1062)

export const mockP10XEligiblePlan = baseEligiblePlan.withInstallmentsCount(10).withInterest(1720)

// Deferred (30 days) 3x plan, without customer fees.
export const mockDeferredMultiInstallmentPlanWithoutFees: EligibilityPlan = baseEligiblePlan
  .withInstallmentsCount(3)
  .withDeferredDays(30)

// Same plan as above, with customer fees charged on the first installment.
export const mockDeferredMultiInstallmentPlanWithFees: EligibilityPlan = baseEligiblePlan
  .withInstallmentsCount(3)
  .withDeferredDays(30)
  .withFees(135)

export const mockPlansAllEligible: EligibilityPlan[] = [
  mockP1XEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
]

export const mockPlansWithoutDeferred: EligibilityPlan[] = [
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
]

export const mockPayNowPlan: EligibilityPlan[] = [mockP1XEligiblePlan]

export const mockButtonPlans: EligibilityPlan[] = [
  mockPayLaterOneMonthEligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
]

export const baseIneligblePlan = ineligiblePlanBuilder().withPurchaseAmount(45000)

export const mockP4XIneligiblePlan = baseIneligblePlan
  .withInstallmentsCount(4)
  .withReasons({ purchase_amount: 'invalid_value' })
  .withConstraints({ purchase_amount: { maximum: 20000, minimum: 9000 } })

export const mockP10XIneligiblePlan = baseIneligblePlan
  .withInstallmentsCount(10)
  .withReasons({ purchase_amount: 'invalid_value' })
  .withConstraints({ purchase_amount: { maximum: 135000, minimum: 90000 } })

export const mockEligibilityPaymentPlanWithIneligiblePlan: EligibilityPlan[] = [
  mockPayLater30DaysEligiblePlan,
  mockP2XEligiblePlan,
  mockP4XIneligiblePlan,
  mockP10XIneligiblePlan,
]

// Same as mockEligibilityPaymentPlanWithIneligiblePlan but the 4x plan is ineligible due to
// a country restriction (not available in Belgium) — the API returns no purchase_amount constraints,
// so there is nothing useful to display grayed out → the plan should be hidden entirely.
export const mockEligibilityWithHiddenPlan: EligibilityPlan[] = [
  ...mockEligibilityPaymentPlanWithIneligiblePlan.slice(0, 2),
  baseIneligblePlan
    .withInstallmentsCount(4)
    .withReasons({ installments_count: 'not_allowed' })
    // No constraints.purchase_amount → plan is hidden, not grayed out
    .withConstraints(undefined),
]

// 4x plan is ineligible due to purchase_amount range — the API returns constraints.purchase_amount,
// so the widget can display a meaningful "À partir de X€" condition → the plan should be grayed out.
export const mockEligibilityWithGrayedOutPlan: EligibilityPlan[] = [
  ...mockEligibilityPaymentPlanWithIneligiblePlan.slice(0, 2),
  baseIneligblePlan
    .withInstallmentsCount(4)
    .withReasons({ purchase_amount: 'invalid_value' })
    // constraints.purchase_amount present → plan is grayed out, not hidden
    .withConstraints({ purchase_amount: { maximum: 15000, minimum: 5000 } }),
]

export const configPlans: ConfigPlan[] = mockPlansAllEligible.map((plan) => ({
  installmentsCount: plan.installments_count,
  deferredDays: plan.deferred_days,
  deferredMonths: plan.deferred_months,
  minAmount: 90_00,
  maxAmount: 3350_00,
}))

/**
 * Returns a copy of `plan` with its `transaction_country` overridden.
 * The input plan is never mutated, so shared fixtures stay reusable across tests.
 */
export const withCountry = (plan: EligibilityPlan, countryCode: string): EligibilityPlan => ({
  ...plan,
  transaction_country: countryCode,
})
