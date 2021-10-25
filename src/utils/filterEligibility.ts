import { EligibilityPlan, EligibilityPlanToDisplay, Plans } from 'types'

const filterELigibility = (
  eligibilities: EligibilityPlan[],
  plans?: Plans[],
): EligibilityPlanToDisplay[] => {
  if (!plans)
    return eligibilities.map((eligibility) => ({
      ...eligibility,
      eligible: true,
      minAmount: 0,
      maxAmount: 0,
    }))
  return eligibilities.reduce((resultEligibilities: EligibilityPlanToDisplay[], eligibility) => {
    const eligibilityDeferredDays =
      (eligibility.deferred_months ? eligibility.deferred_months : 0) * 30 +
      (eligibility.deferred_days ? eligibility.deferred_days : 0)

    const consideredPlan = plans.find((plan) => {
      const planDeferredDays =
        (plan.deferredMonths ? plan.deferredMonths : 0) * 30 +
        (plan.deferredDays ? plan.deferredDays : 0)
      return (
        eligibility.installments_count === plan.installmentsCount &&
        eligibilityDeferredDays === planDeferredDays
      )
    })

    if (consideredPlan) {
      resultEligibilities.push({
        ...eligibility,
        minAmount: consideredPlan.minAmount,
        maxAmount: consideredPlan.maxAmount,
        eligible:
          eligibility.purchase_amount >= consideredPlan.minAmount &&
          eligibility.purchase_amount <= consideredPlan.maxAmount,
      })
    }
    return resultEligibilities
  }, [])
}

export default filterELigibility
