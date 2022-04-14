import { EligibilityPlan } from 'types'

type Args = {
  defaultInstallmentsCount: number | number[]
  eligibilityPlans: EligibilityPlan[]
}

/**
 * It returns the **index** of the **first eligible plan** that matches the default installments count
 *
 * @param {number | number[]} defaultInstallmentsCount
 * @param {EligibilityPlan[]} eligibilityPlans
 * @returns number (index of the first eligible plan that matches the default installments count)
 */
export const getIndexOfActivePlan = ({
  defaultInstallmentsCount,
  eligibilityPlans,
}: Args): number => {
  const defaultInstallmentsArray = Array.isArray(defaultInstallmentsCount)
    ? defaultInstallmentsCount
    : [defaultInstallmentsCount]

  for (const index in defaultInstallmentsArray) {
    const installmentsCount = defaultInstallmentsArray[index]

    const planFound = eligibilityPlans.findIndex((plan) => {
      return plan.installments_count === installmentsCount && plan.eligible
    })

    if (planFound !== -1) {
      return planFound
    }
  }

  return 0
}
