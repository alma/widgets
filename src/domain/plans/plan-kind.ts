import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'

export const isP1X = (plan: EligibilityPlanToDisplay): boolean =>
  plan?.installments_count === 1 && plan?.deferred_days === 0 && plan?.deferred_months === 0

export const isDeferred = (plan: EligibilityPlanToDisplay): boolean =>
  plan.deferred_days > 0 || plan.deferred_months > 0

export const isPayLater = (plan: EligibilityPlanToDisplay): boolean =>
  plan.installments_count === 1 && isDeferred(plan)

export const isPNX = (plan: EligibilityPlanToDisplay): boolean =>
  plan.installments_count > 1 && plan.installments_count <= 4

export const isCredit = (plan: EligibilityPlanToDisplay): boolean => plan.installments_count > 4

export const requiresLegalDisclosure = (plan: EligibilityPlanToDisplay): boolean =>
  isPayLater(plan) || isPNX(plan) || isCredit(plan)
