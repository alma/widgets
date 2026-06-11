import { ConfigPlan, EligibilityPlan, EligibilityPlanToDisplay } from '@/types'

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
  // Remove P1X if no configuration is provided
  if (!configPlans) {
    return eligibilities.filter(
      (plan) =>
        !(plan.installments_count === 1 && plan.deferred_days === 0 && plan.deferred_months === 0),
    )
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

    // Hide when there is no matching merchant config plan (installment count not available),
    // or when the plan is ineligible and has no purchase_amount constraints from the API.
    // The presence of constraints.purchase_amount means the plan is ineligible only due to
    // price range — the widget can still show a meaningful "À partir de X€" condition.
    // Without those constraints, there is nothing useful to display grayed out.
    const hidden = !relatedConfigPlan || (!plan.eligible && !plan.constraints?.purchase_amount)

    return {
      ...plan,
      eligible: isPlanEligible(plan, relatedConfigPlan),
      ...getPaymentPlanBoundaries(plan, relatedConfigPlan),
      hidden,
    }
  })
}

export default filterEligibility
