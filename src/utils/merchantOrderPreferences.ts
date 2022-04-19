import { EligibilityPlan } from 'types'

type Args = {
  priorizedPaymentPlan: number | number[]
  eligibilityPlans: EligibilityPlan[]
}

/**
 * It returns the **index** of the **first eligible plan** that matches the default installments count
 *
 * @param {number | number[]} priorizedPaymentPlan
 * @param {EligibilityPlan[]} eligibilityPlans
 * @returns number (index of the first eligible plan that matches the default installments count)
 */
export const getIndexOfActivePlan = ({ priorizedPaymentPlan, eligibilityPlans }: Args): number => {
  const priorizedPaymentPlanArray = Array.isArray(priorizedPaymentPlan)
    ? priorizedPaymentPlan
    : [priorizedPaymentPlan]

  for (const index in priorizedPaymentPlanArray) {
    const installmentsCount = priorizedPaymentPlanArray[index]

    const planFound = eligibilityPlans.findIndex((plan) => {
      return plan.installments_count === installmentsCount && plan.eligible
    })

    if (planFound !== -1) {
      return planFound
    }
  }

  return 0
}
