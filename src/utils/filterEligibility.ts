import { ConfigPlan, EligibilityPlan, EligibilityPlanToDisplay } from 'types'

const filterELigibility = (
  eligibilities: EligibilityPlan[],
  configPlans?: ConfigPlan[],
): EligibilityPlanToDisplay[] => {
  // Remove p1x
  const filteredEligibilityPlans = eligibilities.filter(
    (plan) =>
      !(plan.installments_count === 1 && plan.deferred_days === 0 && plan.deferred_months === 0),
  )

  // If no configPlans was provided, return eligibility response
  if (!configPlans) {
    return filteredEligibilityPlans
  }

  // Else check if the plan is eligible regarding the related configPlan
  return filteredEligibilityPlans.map((plan) => {
    const eligibilityDeferredDays =
      (plan.deferred_months ? plan.deferred_months : 0) * 30 +
      (plan.deferred_days ? plan.deferred_days : 0)

    // find the related configPlan
    const relatedConfigPlan = configPlans.find((configPlan) => {
      const configPlanDeferredDays =
        (configPlan.deferredMonths ? configPlan.deferredMonths : 0) * 30 +
        (configPlan.deferredDays ? configPlan.deferredDays : 0)
      return (
        plan.installments_count === configPlan.installmentsCount &&
        eligibilityDeferredDays === configPlanDeferredDays
      )
    })
    return {
      ...plan,
      eligible: relatedConfigPlan
        ? plan.purchase_amount > relatedConfigPlan?.minAmount &&
          plan.purchase_amount < relatedConfigPlan?.maxAmount
        : false,
      minAmount: relatedConfigPlan?.minAmount,
      maxAmount: relatedConfigPlan?.maxAmount,
    }
  })
}

export default filterELigibility
