import { ConfigPlan, EligibilityPlan, EligibilityPlanToDisplay } from 'types'

const isPlanEligible = (plan: EligibilityPlan, configPlan?: ConfigPlan) => {
  if (!plan.eligible) {
    return false
  }
  return configPlan
    ? plan.purchase_amount >= configPlan?.minAmount && plan.purchase_amount <= configPlan?.maxAmount
    : false
}

const getPaymentPlanBoundaries = (plan: EligibilityPlan, configPlan?: ConfigPlan) => {
  // When the plan is not eligible, the purchase amount constraints is given from the merchant config
  const purchaseAmountConstraints = plan.constraints?.purchase_amount
  if (purchaseAmountConstraints && configPlan) {
    return {
      minAmount: Math.max(configPlan.minAmount, purchaseAmountConstraints?.minimum),
      maxAmount: Math.min(configPlan.maxAmount, purchaseAmountConstraints?.maximum),
    }
  }
  return configPlan ?? {}
}

const filterEligibility = (
  eligibilities: EligibilityPlan[],
  configPlans?: ConfigPlan[],
): EligibilityPlanToDisplay[] => {
  // Remove non eligible plans
  const eligiblePlans = eligibilities.filter((plan) => plan.eligible)

  // Remove P1X if no configuration is provided
  if (!configPlans) {
    return eligibilities.filter(
      (eligiblePlans) =>
        !(
          eligiblePlans.installments_count === 1 &&
          eligiblePlans.deferred_days === 0 &&
          eligiblePlans.deferred_months === 0
        ),
    )
  }

  // Else check if the plan is eligible regarding the related configPlan
  return eligiblePlans.map((plan) => {
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
      eligible: isPlanEligible(plan, relatedConfigPlan),
      ...getPaymentPlanBoundaries(plan, relatedConfigPlan),
    }
  })
}

export default filterEligibility
