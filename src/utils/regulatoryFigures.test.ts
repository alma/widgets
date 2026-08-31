import {
  getAnnualPercentageRate,
  getCreditDurationInMonths,
  getFinancedAmount,
  getInitialDeposit,
  getTotalCreditCost,
  getTotalPurchaseAmount,
  isDeferred,
} from '@/utils/regulatoryFigures'
import { mockPlansAllEligible } from 'test/fixtures'

describe('regulatoryFigures', () => {
  describe('isDeferred', () => {
    it('should return false for a non-deferred plan', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(isDeferred(p1xPlan)).toBe(false)
    })
    it('should return true when deferred_months is set', () => {
      const payLaterPlan = { ...mockPlansAllEligible[0], deferred_months: 1 }
      expect(isDeferred(payLaterPlan)).toBe(true)
    })
    it('should return true when deferred_days is set', () => {
      const p1xPlanDeferredByDays = { ...mockPlansAllEligible[0], deferred_days: 30 }
      expect(isDeferred(p1xPlanDeferredByDays)).toBe(true)
    })
  })

  describe('getTotalCreditCost', () => {
    it('should return 0 when there is no fee or interest', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(getTotalCreditCost(p1xPlan)).toBe(0)
    })
    it('should return the combined fees and interest amount', () => {
      const planWithCreditCost = { ...mockPlansAllEligible[0], customer_total_cost_amount: 1000 }
      expect(getTotalCreditCost(planWithCreditCost)).toBe(1000)
    })
  })

  describe('getTotalPurchaseAmount', () => {
    it('should return purchase_amount when there is no credit cost', () => {
      const p1xPlan = {
        ...mockPlansAllEligible[0],
        purchase_amount: 10000,
        customer_total_cost_amount: 0,
      }
      expect(getTotalPurchaseAmount(p1xPlan)).toBe(10000)
    })
    it('should return the purchase amount plus the credit cost', () => {
      const planWithCreditCost = {
        ...mockPlansAllEligible[0],
        purchase_amount: 10000,
        customer_total_cost_amount: 500,
      }
      expect(getTotalPurchaseAmount(planWithCreditCost)).toBe(10500)
    })
  })

  describe('getInitialDeposit', () => {
    it('should return the first installment amount for a non-deferred plan', () => {
      const pnxPlan = {
        ...mockPlansAllEligible[0],
        installments_count: 2,
        payment_plan: [
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 0,
            purchase_amount: 3000,
            total_amount: 3000,
          },
        ],
      }
      expect(getInitialDeposit(pnxPlan)).toBe(3000)
    })
    it('should return 0 for a deferred plan', () => {
      const payLaterPlan = { ...mockPlansAllEligible[0], deferred_months: 1 }
      expect(getInitialDeposit(payLaterPlan)).toBe(0)
    })
    it('should return 0 when there is no payment plan', () => {
      const p1xPlanWithoutPaymentPlan = { ...mockPlansAllEligible[0], payment_plan: undefined }
      expect(getInitialDeposit(p1xPlanWithoutPaymentPlan)).toBe(0)
    })
    it('should return 0 when the payment plan is an empty array', () => {
      const p1xPlanWithEmptyPaymentPlan = { ...mockPlansAllEligible[0], payment_plan: [] }
      expect(getInitialDeposit(p1xPlanWithEmptyPaymentPlan)).toBe(0)
    })
  })

  describe('getFinancedAmount', () => {
    it('should return the total purchase amount minus the initial deposit', () => {
      const pnxPlan = {
        ...mockPlansAllEligible[0],
        installments_count: 2,
        purchase_amount: 10000,
        customer_total_cost_amount: 0,
        payment_plan: [
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 0,
            purchase_amount: 5000,
            total_amount: 5000,
          },
          {
            customer_fee: 0,
            customer_interest: 0,
            due_date: 0,
            purchase_amount: 5000,
            total_amount: 5000,
          },
        ],
      }
      expect(getFinancedAmount(pnxPlan)).toBe(5000)
    })
    it('should return the total purchase amount for a deferred plan (no upfront deposit)', () => {
      const payLaterPlan = { ...mockPlansAllEligible[0], deferred_months: 1 }
      expect(getFinancedAmount(payLaterPlan)).toBe(getTotalPurchaseAmount(payLaterPlan))
    })
  })

  describe('getCreditDurationInMonths', () => {
    it('should exclude the first installment from the financed duration', () => {
      const plan = { ...mockPlansAllEligible[0], installments_count: 5 }
      expect(getCreditDurationInMonths(plan)).toBe(4)
    })
    // Defensive only: this function is scoped to non-p1x plans
    it('should return 0 for a single-installment plan', () => {
      const p1xPlan = { ...mockPlansAllEligible[0], installments_count: 1 }
      expect(getCreditDurationInMonths(p1xPlan)).toBe(0)
    })
  })

  describe('getAnnualPercentageRate', () => {
    it('should return 0 when annual_interest_rate is not set', () => {
      const p1xPlan = { ...mockPlansAllEligible[0], annual_interest_rate: undefined }
      expect(getAnnualPercentageRate(p1xPlan)).toBe(0)
    })
    it('should return annual_interest_rate converted into a rate', () => {
      const planWithInterest = { ...mockPlansAllEligible[0], annual_interest_rate: 500 }
      expect(getAnnualPercentageRate(planWithInterest)).toBe(0.05)
    })
  })
})
