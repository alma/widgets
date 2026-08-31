import { EligibilityPlan } from '@/types'

export const isDeferred = (plan: EligibilityPlan): boolean =>
  plan.deferred_days > 0 || plan.deferred_months > 0

export const isPayLater = (plan: EligibilityPlan): boolean =>
  plan.installments_count === 1 && isDeferred(plan)

export const isPNX = (plan: EligibilityPlan): boolean => plan.installments_count > 1

export const requiresLegalDisclosure = (plan: EligibilityPlan): boolean =>
  isPayLater(plan) || isPNX(plan)

export const getTotalCreditCost = (plan: EligibilityPlan): number => plan.customer_total_cost_amount

export const getTotalPurchaseAmount = (plan: EligibilityPlan): number =>
  plan.purchase_amount + getTotalCreditCost(plan)

export const getInitialDeposit = (plan: EligibilityPlan): number =>
  isDeferred(plan) ? 0 : (plan.payment_plan?.[0]?.total_amount ?? 0)

export const getFinancedAmount = (plan: EligibilityPlan): number =>
  getTotalPurchaseAmount(plan) - getInitialDeposit(plan)

// Only used for PNX plans
export const getCreditDurationInMonths = (plan: EligibilityPlan): number =>
  plan.installments_count - 1

export const getAnnualPercentageRate = (plan: EligibilityPlan): number =>
  (plan.annual_interest_rate ?? 0) / 10000
