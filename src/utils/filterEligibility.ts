import { EligibilityPlan, EligibilityPlanToDisplay, configPlans } from 'types'

const filterELigibility = (
  eligibilities: EligibilityPlan[],
  configPlans?: configPlans[],
): EligibilityPlanToDisplay[] => {
  if (!configPlans)
    return eligibilities
      .map((eligibility) => ({
        ...eligibility,
        eligible: true,
        minAmount: 0,
        maxAmount: 0,
      }))
      .filter(
        (eligibility) =>
          !(
            eligibility.installments_count === 1 &&
            eligibility.deferred_days === 0 &&
            eligibility.deferred_months === 0
          ),
      )
  return eligibilities.reduce((resultEligibilities: EligibilityPlanToDisplay[], eligibility) => {
    const eligibilityDeferredDays =
      (eligibility.deferred_months ? eligibility.deferred_months : 0) * 30 +
      (eligibility.deferred_days ? eligibility.deferred_days : 0)

    //retirieve the plan that matches eligibility
    const consideredPlan = configPlans.find((plan) => {
      const planDeferredDays =
        (plan.deferredMonths ? plan.deferredMonths : 0) * 30 +
        (plan.deferredDays ? plan.deferredDays : 0)
      return (
        eligibility.installments_count === plan.installmentsCount &&
        eligibilityDeferredDays === planDeferredDays
      )
    })

    //filter P1x as will not offer it on widget
    const isP1x =
      eligibility.installments_count === 1 &&
      eligibility.deferred_months === 0 &&
      eligibility.deferred_days === 0

    //return eligibilities that we will display
    if (consideredPlan && !isP1x) {
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
