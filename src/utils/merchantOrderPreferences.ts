import { EligibilityPlan } from 'types'

type Args = {
  suggestedPaymentPlan: number | number[]
  eligibilityPlans: EligibilityPlan[]
}

/**
 * It returns the **index** of the **first eligible plan** that matches the default installments count
 *
 * @param {number | number[]} suggestedPaymentPlan
 * @param {EligibilityPlan[]} eligibilityPlans
 * @returns number (index of the first eligible plan that matches the default installments count)
 */
export const getIndexOfActivePlan = ({ suggestedPaymentPlan, eligibilityPlans }: Args): number => {
  const suggestedPaymentPlanArray = Array.isArray(suggestedPaymentPlan)
    ? suggestedPaymentPlan
    : [suggestedPaymentPlan]

  for (const index in suggestedPaymentPlanArray) {
    const installmentsCount = suggestedPaymentPlanArray[index]

    const planFound = eligibilityPlans.findIndex((plan) => {
      return (
        plan.installments_count === installmentsCount &&
        plan.eligible &&
        // Remove the PayLater plans from the plan to target, we will code a better solution later
        // To differentiate P1X from PayLater while using the `suggestedPaymentPlan` property.
        !plan.deferred_days &&
        !plan.deferred_months
      )
    })

    if (planFound !== -1) {
      return planFound
    }
  }

  return 0
}
