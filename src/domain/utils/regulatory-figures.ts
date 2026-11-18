import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { isCredit, isDeferred, isP1X, isPayLater, isPNX } from '@/domain/utils/plan-kind'

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

export const shouldNotifyCustomerOfNoFees = (plan: EligibilityPlanToDisplay): boolean => {
  const isBelgiumTransaction = plan.transaction_country === 'BE'
  const hasNoFees = !!plan.payment_plan?.every(
    (installment) => installment.customer_fee === 0 && installment.customer_interest === 0,
  )
  const isPlanAffectedByNoFeesMention = isP1X(plan) || isPayLater(plan) || isPNX(plan)
  return !isBelgiumTransaction && hasNoFees && plan.eligible && isPlanAffectedByNoFeesMention
}
