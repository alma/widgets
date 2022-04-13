import { EligibilityPlan } from 'types'

type Args = {
  defaultInstallmentsCount: number | number[]
  eligibilityPlans: EligibilityPlan[]
}

export const getIndexOfActivePlan = ({
  defaultInstallmentsCount,
  eligibilityPlans,
}: Args): number => {
  const defaultInstallmentsArray = Array.isArray(defaultInstallmentsCount)
    ? defaultInstallmentsCount
    : [defaultInstallmentsCount]

  for (const index in defaultInstallmentsArray) {
    const installmentsCount = defaultInstallmentsArray[index]

    const founded = eligibilityPlans.findIndex((plan) => {
      return plan.installments_count === installmentsCount && plan.eligible
    })

    if (founded !== -1) {
      return founded
    }
  }

  return 0
}
