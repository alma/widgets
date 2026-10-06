import { isCredit, isDeferred } from '@/domain/plans/plan-kind'
import { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'

export const getTotalCreditCost = (plan: EligibilityPlanToDisplay): number =>
  plan.customer_total_cost_amount ?? 0

export const getCustomerFees = (plan: EligibilityPlanToDisplay): number => plan.customer_fee ?? 0

export const getTotalPurchaseAmount = (plan: EligibilityPlanToDisplay): number =>
  plan.purchase_amount + getTotalCreditCost(plan)

export const getInitialDeposit = (plan: EligibilityPlanToDisplay): number =>
  isDeferred(plan) ? 0 : (plan.payment_plan?.[0]?.total_amount ?? 0)

export const getFinancedAmount = (plan: EligibilityPlanToDisplay): number =>
  getTotalPurchaseAmount(plan) - getInitialDeposit(plan)

// Only used for PNX and credit plans
export const getCreditDurationInMonths = (plan: EligibilityPlanToDisplay): number =>
  plan.installments_count - 1

export const getAnnualPercentageRate = (plan: EligibilityPlanToDisplay): number =>
  (plan.annual_interest_rate ?? 0) / 10000

export const getCustomerLendingRate = (plan: EligibilityPlanToDisplay): number => {
  if (isCredit(plan)) {
    return getAnnualPercentageRate(plan)
  }
  return 0
}
