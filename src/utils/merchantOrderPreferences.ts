import { EligibilityPlan } from 'types'

type Args = {
  firstDisplayedPaymentPlan: number | number[]
  eligibilityPlans: EligibilityPlan[]
}

/**
 * It returns the **index** of the **first eligible plan** that matches the default installments count
 *
 * @param {number | number[]} firstDisplayedPaymentPlan
 * @param {EligibilityPlan[]} eligibilityPlans
 * @returns number (index of the first eligible plan that matches the default installments count)
 */
export const getIndexOfActivePlan = ({
  firstDisplayedPaymentPlan,
  eligibilityPlans,
}: Args): number => {
  const firstDisplayedPaymentPlanArray = Array.isArray(firstDisplayedPaymentPlan)
    ? firstDisplayedPaymentPlan
    : [firstDisplayedPaymentPlan]

  for (const index in firstDisplayedPaymentPlanArray) {
    const installmentsCount = firstDisplayedPaymentPlanArray[index]

    const planFound = eligibilityPlans.findIndex((plan) => {
      return plan.installments_count === installmentsCount && plan.eligible
    })

    if (planFound !== -1) {
      return planFound
    }
  }

  return 0
}
