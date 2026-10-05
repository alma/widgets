import type { EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import {
  isCredit,
  isDeferred,
  isP1X,
  isPayLater,
  isPNX,
  requiresLegalDisclosure,
} from '@/domain/plans/plan-kind'
import { mockP1XEligiblePlan } from '@/test/fixtures'

describe('planKind', () => {
  describe('isP1X', () => {
    it('should return true if plan is P1X', () => {
      const result = isP1X({
        installments_count: 1,
        deferred_months: 0,
        deferred_days: 0,
      } as EligibilityPlan)
      expect(result).toBe(true)
    })
    it('should return false if plan is not P1X', () => {
      const result1 = isP1X({
        installments_count: 2,
        deferred_months: 0,
        deferred_days: 0,
      } as EligibilityPlan)

      const result2 = isP1X({
        installments_count: 1,
        deferred_months: 1,
        deferred_days: 0,
      } as EligibilityPlan)

      const result3 = isP1X({
        installments_count: 1,
        deferred_months: 0,
        deferred_days: 1,
      } as EligibilityPlan)

      expect(result1).toBe(false)
      expect(result2).toBe(false)
      expect(result3).toBe(false)
    })
  })

  describe('isDeferred', () => {
    it('should return false for a non-deferred plan', () => {
      const p1xPlan = mockP1XEligiblePlan
      expect(isDeferred(p1xPlan)).toBe(false)
    })
    it('should return true when deferred_months is set', () => {
      const payLaterPlan = { ...mockP1XEligiblePlan, deferred_months: 1 }
      expect(isDeferred(payLaterPlan)).toBe(true)
    })
    it('should return true when deferred_days is set', () => {
      const p1xPlanDeferredByDays = { ...mockP1XEligiblePlan, deferred_days: 30 }
      expect(isDeferred(p1xPlanDeferredByDays)).toBe(true)
    })
  })

  describe('requiresLegalDisclosure', () => {
    it('should return false for a p1x plan', () => {
      const p1xPlan = mockP1XEligiblePlan
      expect(requiresLegalDisclosure(p1xPlan)).toBe(false)
    })
    it('should return true for a non-p1x plan', () => {
      const pnxPlan = { ...mockP1XEligiblePlan, installments_count: 2 }
      expect(requiresLegalDisclosure(pnxPlan)).toBe(true)
    })
    it('should return true for a deferred p1x plan (Pay Later)', () => {
      const payLaterPlan = { ...mockP1XEligiblePlan, deferred_months: 1 }
      expect(requiresLegalDisclosure(payLaterPlan)).toBe(true)
    })
    it('should return true for a deferred, multi-installment plan', () => {
      const deferredPnxPlan = {
        ...mockP1XEligiblePlan,
        installments_count: 2,
        deferred_months: 1,
      }
      expect(requiresLegalDisclosure(deferredPnxPlan)).toBe(true)
    })
    it('should return true for a credit plan', () => {
      const creditPlan = { ...mockP1XEligiblePlan, installments_count: 5 }
      expect(requiresLegalDisclosure(creditPlan)).toBe(true)
    })
  })

  describe('isPayLater', () => {
    it('should return false for a non-deferred p1x plan', () => {
      const p1xPlan = mockP1XEligiblePlan
      expect(isPayLater(p1xPlan)).toBe(false)
    })
    it('should return true for a deferred p1x plan', () => {
      const payLaterPlan = { ...mockP1XEligiblePlan, deferred_months: 1 }
      expect(isPayLater(payLaterPlan)).toBe(true)
    })
    it('should return false for a non-deferred, multi-installment plan', () => {
      const pnxPlan = { ...mockP1XEligiblePlan, installments_count: 2 }
      expect(isPayLater(pnxPlan)).toBe(false)
    })
    it('should return false for a deferred, multi-installment plan', () => {
      const deferredPnxPlan = {
        ...mockP1XEligiblePlan,
        installments_count: 2,
        deferred_months: 1,
      }
      expect(isPayLater(deferredPnxPlan)).toBe(false)
    })
  })

  describe('isPNX', () => {
    it('should return false for a single-installment plan', () => {
      const p1xPlan = mockP1XEligiblePlan
      expect(isPNX(p1xPlan)).toBe(false)
    })
    it('should return false for a deferred single-installment plan (Pay Later, not PNX)', () => {
      const payLaterPlan = { ...mockP1XEligiblePlan, deferred_months: 1 }
      expect(isPNX(payLaterPlan)).toBe(false)
    })
    it('should return true for a multi-installment plan', () => {
      const pnxPlan = { ...mockP1XEligiblePlan, installments_count: 2 }
      expect(isPNX(pnxPlan)).toBe(true)
    })
    it('should return true for a multi-installment plan regardless of deferred status', () => {
      const deferredPnxPlan = {
        ...mockP1XEligiblePlan,
        installments_count: 2,
        deferred_months: 1,
      }
      expect(isPNX(deferredPnxPlan)).toBe(true)
    })
    it('should return false for a credit plan (installments_count > 4)', () => {
      const creditPlan = { ...mockP1XEligiblePlan, installments_count: 5 }
      expect(isPNX(creditPlan)).toBe(false)
    })
    it('should return true for the upper bound of installments_count (4)', () => {
      const pnxPlan = { ...mockP1XEligiblePlan, installments_count: 4 }
      expect(isPNX(pnxPlan)).toBe(true)
    })
  })

  describe('isCredit', () => {
    it('should return false for a single-installment plan', () => {
      const p1xPlan = mockP1XEligiblePlan
      expect(isCredit(p1xPlan)).toBe(false)
    })
    it('should return false for a plan with 4 or fewer installments', () => {
      const pnxPlan = { ...mockP1XEligiblePlan, installments_count: 4 }
      expect(isCredit(pnxPlan)).toBe(false)
    })
    it('should return true for a plan with more than 4 installments', () => {
      const creditPlan = { ...mockP1XEligiblePlan, installments_count: 5 }
      expect(isCredit(creditPlan)).toBe(true)
    })
  })
})
