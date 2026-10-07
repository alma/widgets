import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import {
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures'
import { getIndexOfActivePlan } from '@/widgets/payment-plans/active-plan'

// mockPlansAllEligible holds P1X, Pay Later (one month), 2x, 3x, 4x and 10x, in this order.
const eligibilityPlans: EligibilityPlanToDisplay[] = mockPlansAllEligible
const P1X_INDEX = 0
const P3X_INDEX = 3
const P4X_INDEX = 4
const P10X_INDEX = 5

describe('getIndexOfActivePlan', () => {
  it('should return the index of the plan that matches the suggested installments count', () => {
    expect(getIndexOfActivePlan({ suggestedPaymentPlan: 3, eligibilityPlans })).toBe(P3X_INDEX)
  })

  it('should return the index of the P1X plan for one installment', () => {
    expect(getIndexOfActivePlan({ suggestedPaymentPlan: 1, eligibilityPlans })).toBe(P1X_INDEX)
  })

  it('should return 0 when no plan matches', () => {
    expect(getIndexOfActivePlan({ suggestedPaymentPlan: 7, eligibilityPlans })).toBe(0)
  })

  it('should return 0 when there is no plan', () => {
    expect(getIndexOfActivePlan({ suggestedPaymentPlan: 3, eligibilityPlans: [] })).toBe(0)
  })

  describe('with a list of suggested installments counts', () => {
    it('should follow the order of the suggestions, not the order of the plans', () => {
      expect(getIndexOfActivePlan({ suggestedPaymentPlan: [10, 3], eligibilityPlans })).toBe(
        P10X_INDEX,
      )
    })

    it('should use the next suggestion when the previous ones match no plan', () => {
      expect(getIndexOfActivePlan({ suggestedPaymentPlan: [7, 4], eligibilityPlans })).toBe(
        P4X_INDEX,
      )
    })

    it('should return 0 when no suggestion matches', () => {
      expect(getIndexOfActivePlan({ suggestedPaymentPlan: [7, 8], eligibilityPlans })).toBe(0)
    })

    it('should return 0 for an empty list', () => {
      expect(getIndexOfActivePlan({ suggestedPaymentPlan: [], eligibilityPlans })).toBe(0)
    })
  })

  describe('ineligible and deferred plans', () => {
    it('should skip a plan that is not eligible', () => {
      const plans = eligibilityPlans.map((plan) =>
        plan.installments_count === 3 ? { ...plan, eligible: false } : plan,
      )

      expect(getIndexOfActivePlan({ suggestedPaymentPlan: 3, eligibilityPlans: plans })).toBe(0)
    })

    it('should use the next suggestion when the first match is not eligible', () => {
      const plans = eligibilityPlans.map((plan) =>
        plan.installments_count === 3 ? { ...plan, eligible: false } : plan,
      )

      expect(getIndexOfActivePlan({ suggestedPaymentPlan: [3, 4], eligibilityPlans: plans })).toBe(
        P4X_INDEX,
      )
    })

    it('should not target a Pay Later plan with one installment', () => {
      // The Pay Later plan comes before the P1X plan.
      const plans = [mockPayLaterOneMonthEligiblePlan, mockP1XEligiblePlan]

      expect(getIndexOfActivePlan({ suggestedPaymentPlan: 1, eligibilityPlans: plans })).toBe(1)
    })

    it('should return 0 when the only plan with one installment is deferred', () => {
      const plans = [mockP2XEligiblePlan, mockPayLater30DaysEligiblePlan]

      expect(getIndexOfActivePlan({ suggestedPaymentPlan: 1, eligibilityPlans: plans })).toBe(0)
    })
  })
})
