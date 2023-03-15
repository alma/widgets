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

const filterELigibility = (
  eligibilities: EligibilityPlan[],
  configPlans?: ConfigPlan[],
): EligibilityPlanToDisplay[] => {
  let eligibilitiesToDisplay = eligibilities

  const askedForP1X = configPlans?.find(
    (plan) => plan.installmentsCount === 1 && plan.deferredDays === 0 && plan.deferredMonths === 0,
  )

  // Remove p1x
  if (!askedForP1X) {
    eligibilitiesToDisplay = eligibilities.filter(
      (plan) =>
        !(plan.installments_count === 1 && plan.deferred_days === 0 && plan.deferred_months === 0),
    )
  }

  // If no configPlans was provided, return eligibility response
  if (!configPlans) {
    return eligibilitiesToDisplay
  }

  // Else check if the plan is eligible regarding the related configPlan
  return eligibilities.map((plan) => {
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

export default filterELigibility
