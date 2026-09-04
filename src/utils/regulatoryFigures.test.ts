import {
  getAnnualPercentageRate,
  getCreditDurationInMonths,
  getCustomerFees,
  getFinancedAmount,
  getInitialDeposit,
  getTotalCreditCost,
  getTotalPurchaseAmount,
  isCredit,
  isDeferred,
  isPayLater,
  isPNX,
  requiresLegalDisclosure,
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

  describe('getCustomerFees', () => {
    it('should return 0 when there is no fee', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(getCustomerFees(p1xPlan)).toBe(0)
    })
    it('should return the customer fee amount', () => {
      const planWithFees = { ...mockPlansAllEligible[0], customer_fee: 135 }
      expect(getCustomerFees(planWithFees)).toBe(135)
    })
    it('should return 0 when customer_fee is undefined', () => {
      const planWithoutFees = { ...mockPlansAllEligible[0], customer_fee: undefined }
      expect(getCustomerFees(planWithoutFees)).toBe(0)
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

  describe('requiresLegalDisclosure', () => {
    it('should return false for a p1x plan', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(requiresLegalDisclosure(p1xPlan)).toBe(false)
    })
    it('should return true for a non-p1x plan', () => {
      const pnxPlan = { ...mockPlansAllEligible[0], installments_count: 2 }
      expect(requiresLegalDisclosure(pnxPlan)).toBe(true)
    })
    it('should return true for a deferred p1x plan (Pay Later)', () => {
      const payLaterPlan = { ...mockPlansAllEligible[0], deferred_months: 1 }
      expect(requiresLegalDisclosure(payLaterPlan)).toBe(true)
    })
    it('should return true for a deferred, multi-installment plan', () => {
      const deferredPnxPlan = {
        ...mockPlansAllEligible[0],
        installments_count: 2,
        deferred_months: 1,
      }
      expect(requiresLegalDisclosure(deferredPnxPlan)).toBe(true)
    })
    it('should return true for a credit plan', () => {
      const creditPlan = { ...mockPlansAllEligible[0], installments_count: 5 }
      expect(requiresLegalDisclosure(creditPlan)).toBe(true)
    })
  })

  describe('isPayLater', () => {
    it('should return false for a non-deferred p1x plan', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(isPayLater(p1xPlan)).toBe(false)
    })
    it('should return true for a deferred p1x plan', () => {
      const payLaterPlan = { ...mockPlansAllEligible[0], deferred_months: 1 }
      expect(isPayLater(payLaterPlan)).toBe(true)
    })
    it('should return false for a non-deferred, multi-installment plan', () => {
      const pnxPlan = { ...mockPlansAllEligible[0], installments_count: 2 }
      expect(isPayLater(pnxPlan)).toBe(false)
    })
    it('should return false for a deferred, multi-installment plan', () => {
      const deferredPnxPlan = {
        ...mockPlansAllEligible[0],
        installments_count: 2,
        deferred_months: 1,
      }
      expect(isPayLater(deferredPnxPlan)).toBe(false)
    })
  })

  describe('isPNX', () => {
    it('should return false for a single-installment plan', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(isPNX(p1xPlan)).toBe(false)
    })
    it('should return false for a deferred single-installment plan (Pay Later, not PNX)', () => {
      const payLaterPlan = { ...mockPlansAllEligible[0], deferred_months: 1 }
      expect(isPNX(payLaterPlan)).toBe(false)
    })
    it('should return true for a multi-installment plan', () => {
      const pnxPlan = { ...mockPlansAllEligible[0], installments_count: 2 }
      expect(isPNX(pnxPlan)).toBe(true)
    })
    it('should return true for a multi-installment plan regardless of deferred status', () => {
      const deferredPnxPlan = {
        ...mockPlansAllEligible[0],
        installments_count: 2,
        deferred_months: 1,
      }
      expect(isPNX(deferredPnxPlan)).toBe(true)
    })
    it('should return false for a credit plan (installments_count > 4)', () => {
      const creditPlan = { ...mockPlansAllEligible[0], installments_count: 5 }
      expect(isPNX(creditPlan)).toBe(false)
    })
    it('should return true for the upper bound of installments_count (4)', () => {
      const pnxPlan = { ...mockPlansAllEligible[0], installments_count: 4 }
      expect(isPNX(pnxPlan)).toBe(true)
    })
  })

  describe('isCredit', () => {
    it('should return false for a single-installment plan', () => {
      const p1xPlan = mockPlansAllEligible[0]
      expect(isCredit(p1xPlan)).toBe(false)
    })
    it('should return false for a plan with 4 or fewer installments', () => {
      const pnxPlan = { ...mockPlansAllEligible[0], installments_count: 4 }
      expect(isCredit(pnxPlan)).toBe(false)
    })
    it('should return true for a plan with more than 4 installments', () => {
      const creditPlan = { ...mockPlansAllEligible[0], installments_count: 5 }
      expect(isCredit(creditPlan)).toBe(true)
    })
  })
})
