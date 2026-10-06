import filterEligibility from '@/domain/plans/filter-plans'
import type { ConfigPlan, EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import {
  configPlans,
  mockEligibilityPaymentPlanWithIneligiblePlan,
  mockEligibilityWithGrayedOutPlan,
  mockEligibilityWithHiddenPlan,
  mockP10XEligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures'

const planConfig = (overrides: Partial<ConfigPlan> = {}): ConfigPlan => ({
  installmentsCount: 2,
  minAmount: 9000,
  maxAmount: 335000,
  ...overrides,
})

const findByInstallments = (plans: EligibilityPlanToDisplay[], installmentsCount: number) =>
  plans.find((plan) => plan.installments_count === installmentsCount)

describe('filterEligibility', () => {
  describe('without configuration plans', () => {
    it('should remove the P1X plan and keep the other ones untouched', () => {
      const result = filterEligibility(mockPlansAllEligible)

      expect(result).toEqual([
        mockPayLaterOneMonthEligiblePlan,
        mockP2XEligiblePlan,
        mockP3XEligiblePlanWithFees,
        mockP4XEligiblePlanWithFees,
        mockP10XEligiblePlan,
      ])
    })

    it('should keep the Pay Later plans, which are not P1X', () => {
      const result = filterEligibility([
        mockP1XEligiblePlan,
        mockPayLaterOneMonthEligiblePlan,
        mockPayLater30DaysEligiblePlan,
      ])

      expect(result).toEqual([mockPayLaterOneMonthEligiblePlan, mockPayLater30DaysEligiblePlan])
    })

    it('should not add the hidden flag', () => {
      const result = filterEligibility(mockPlansAllEligible)

      result.forEach((plan) => expect(plan).not.toHaveProperty('hidden'))
    })

    it('should return an empty list when there is no plan', () => {
      expect(filterEligibility([])).toEqual([])
    })
  })

  describe('with configuration plans', () => {
    it('should flag every plan eligible when the purchase amount is in the range of its config', () => {
      const result = filterEligibility(mockPlansAllEligible, configPlans)

      expect(result).toHaveLength(mockPlansAllEligible.length)
      result.forEach((plan) => {
        expect(plan).toMatchObject({
          eligible: true,
          hidden: false,
          minAmount: 9000,
          maxAmount: 335000,
        })
      })
    })

    it('should keep the fields of the eligibility plan', () => {
      const [plan] = filterEligibility([mockP2XEligiblePlan], [planConfig()])

      expect(plan).toMatchObject({
        installments_count: 2,
        purchase_amount: 45000,
        payment_plan: mockP2XEligiblePlan.payment_plan,
      })
    })

    it('should keep the order of the eligibility plans', () => {
      const result = filterEligibility(mockPlansAllEligible, configPlans)

      expect(result.map((plan) => plan.installments_count)).toEqual(
        mockPlansAllEligible.map((plan) => plan.installments_count),
      )
    })

    describe('purchase amount range', () => {
      it('should flag an eligible plan as not eligible when the purchase amount is below the minimum', () => {
        const [plan] = filterEligibility([mockP2XEligiblePlan], [planConfig({ minAmount: 45001 })])

        expect(plan).toMatchObject({ eligible: false, hidden: false })
      })

      it('should flag an eligible plan as not eligible when the purchase amount is above the maximum', () => {
        const [plan] = filterEligibility([mockP2XEligiblePlan], [planConfig({ maxAmount: 44999 })])

        expect(plan).toMatchObject({ eligible: false, hidden: false })
      })

      it('should include the bounds of the range', () => {
        const [atMinimum] = filterEligibility(
          [mockP2XEligiblePlan],
          [planConfig({ minAmount: 45000 })],
        )
        const [atMaximum] = filterEligibility(
          [mockP2XEligiblePlan],
          [planConfig({ maxAmount: 45000 })],
        )

        expect(atMinimum.eligible).toBe(true)
        expect(atMaximum.eligible).toBe(true)
      })
    })

    describe('matching the configuration plan', () => {
      it('should hide the plans that have no configuration plan', () => {
        const result = filterEligibility(mockPlansAllEligible, [planConfig()])

        const [matching] = result.filter((plan) => plan.installments_count === 2)
        expect(matching).toMatchObject({ eligible: true, hidden: false })

        const others = result.filter((plan) => plan.installments_count !== 2)
        expect(others).toHaveLength(mockPlansAllEligible.length - 1)
        others.forEach((plan) => {
          expect(plan).toMatchObject({ eligible: false, hidden: true })
          expect(plan).not.toHaveProperty('minAmount')
          expect(plan).not.toHaveProperty('maxAmount')
        })
      })

      it('should hide every plan when the list of configuration plans is empty', () => {
        const result = filterEligibility(mockPlansAllEligible, [])

        result.forEach((plan) => expect(plan).toMatchObject({ eligible: false, hidden: true }))
      })

      it('should match a plan deferred by one month with a config deferred by 30 days', () => {
        const [plan] = filterEligibility(
          [mockPayLaterOneMonthEligiblePlan],
          [planConfig({ installmentsCount: 1, deferredDays: 30 })],
        )

        expect(plan).toMatchObject({ eligible: true, hidden: false })
      })

      it('should match a plan deferred by 30 days with a config deferred by one month', () => {
        const [plan] = filterEligibility(
          [mockPayLater30DaysEligiblePlan],
          [planConfig({ installmentsCount: 1, deferredMonths: 1 })],
        )

        expect(plan).toMatchObject({ eligible: true, hidden: false })
      })

      it('should not match a Pay Later plan with the P1X config', () => {
        const [plan] = filterEligibility(
          [mockPayLaterOneMonthEligiblePlan],
          [planConfig({ installmentsCount: 1 })],
        )

        expect(plan).toMatchObject({ eligible: false, hidden: true })
      })

      it('should not match a P1X plan with a Pay Later config', () => {
        const [plan] = filterEligibility(
          [mockP1XEligiblePlan],
          [planConfig({ installmentsCount: 1, deferredDays: 15 })],
        )

        expect(plan).toMatchObject({ eligible: false, hidden: true })
      })
    })

    describe('ineligible plans', () => {
      it('should gray out an ineligible plan that has purchase amount constraints', () => {
        const result = filterEligibility(mockEligibilityPaymentPlanWithIneligiblePlan, configPlans)

        expect(findByInstallments(result, 4)).toMatchObject({ eligible: false, hidden: false })
        expect(findByInstallments(result, 10)).toMatchObject({ eligible: false, hidden: false })
      })

      it('should narrow the range of the config to the constraints of the API', () => {
        const result = filterEligibility(mockEligibilityPaymentPlanWithIneligiblePlan, configPlans)

        // Constraints 90000 - 135000 are inside the config range 9000 - 335000
        expect(findByInstallments(result, 10)).toMatchObject({
          minAmount: 90000,
          maxAmount: 135000,
        })
      })

      it('should keep the minimum of the config when it is above the one of the API', () => {
        const result = filterEligibility(mockEligibilityWithGrayedOutPlan, configPlans)

        // Constraints 5000 - 15000, config 9000 - 335000
        expect(findByInstallments(result, 4)).toMatchObject({
          eligible: false,
          hidden: false,
          minAmount: 9000,
          maxAmount: 15000,
        })
      })

      it('should keep the maximum of the config when it is under the one of the API', () => {
        const result = filterEligibility(mockEligibilityWithGrayedOutPlan, [
          planConfig({ installmentsCount: 4, minAmount: 1000, maxAmount: 12000 }),
        ])

        // Constraints 5000 - 15000, config 1000 - 12000
        expect(findByInstallments(result, 4)).toMatchObject({
          minAmount: 5000,
          maxAmount: 12000,
        })
      })

      it('should hide an ineligible plan that has no purchase amount constraints', () => {
        const result = filterEligibility(mockEligibilityWithHiddenPlan, configPlans)

        expect(findByInstallments(result, 4)).toMatchObject({
          eligible: false,
          hidden: true,
          minAmount: 9000,
          maxAmount: 335000,
        })
      })

      it('should keep the eligible plans eligible next to the ineligible ones', () => {
        const result = filterEligibility(mockEligibilityWithHiddenPlan, configPlans)

        expect(findByInstallments(result, 2)).toMatchObject({ eligible: true, hidden: false })
        expect(result.find((plan) => plan.deferred_days === 30)).toMatchObject({
          eligible: true,
          hidden: false,
        })
      })

      it('should hide an ineligible plan that has no configuration plan', () => {
        const result = filterEligibility(mockEligibilityWithGrayedOutPlan, [
          planConfig({ installmentsCount: 2 }),
        ])

        expect(findByInstallments(result, 4)).toMatchObject({ eligible: false, hidden: true })
        expect(findByInstallments(result, 4)).not.toHaveProperty('minAmount')
      })
    })
  })
})
