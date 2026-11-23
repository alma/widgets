import {
  isCredit,
  isDeferred,
  isP1X,
  isPayLater,
  isPNX,
  isSomePlanDeferred,
  requiresLegalDisclosure,
} from '@/domain/utils/plan-kind'
import {
  mockP1XEligiblePlan,
  mockP4XIneligiblePlan,
  mockPlansWithoutDeferred,
} from '@/test/fixtures/plans'

const predicates = { isP1X, isDeferred, isPayLater, isPNX, isCredit, requiresLegalDisclosure }

const buildPlan = (installmentsCount: number, deferredMonths = 0, deferredDays = 0) => ({
  ...mockP1XEligiblePlan,
  installments_count: installmentsCount,
  deferred_months: deferredMonths,
  deferred_days: deferredDays,
})

describe('planKind', () => {
  describe('isSomePlanDeferred', () => {
    it('should return false when no plan is deferred', () => {
      expect(isSomePlanDeferred(mockPlansWithoutDeferred)).toBe(false)
    })
    it('should count an ineligible deferred plan', () => {
      const ineligibleDeferredPlan = { ...mockP4XIneligiblePlan, deferred_months: 1 }
      expect(isSomePlanDeferred([...mockPlansWithoutDeferred, ineligibleDeferredPlan])).toBe(true)
    })
  })

  // The predicates that return true for each plan.
  it.each([
    ['P1X', buildPlan(1), 'isP1X'],
    ['Pay Later by months', buildPlan(1, 1), 'isDeferred isPayLater requiresLegalDisclosure'],
    ['Pay Later by days', buildPlan(1, 0, 30), 'isDeferred isPayLater requiresLegalDisclosure'],
    ['2x', buildPlan(2), 'isPNX requiresLegalDisclosure'],
    ['4x', buildPlan(4), 'isPNX requiresLegalDisclosure'],
    ['deferred 2x', buildPlan(2, 1), 'isDeferred isPNX requiresLegalDisclosure'],
    ['5x', buildPlan(5), 'isCredit requiresLegalDisclosure'],
    // The API sends no such plans. Neither gets a legal disclosure.
    ['a negative deferral', buildPlan(1, 0, -30), ''],
    ['no installments count', buildPlan(0), ''],
  ])('should classify the %s plan', (_, plan, kinds) => {
    const matching = Object.entries(predicates)
      .filter(([, predicate]) => predicate(plan))
      .map(([name]) => name)

    expect(matching.join(' ')).toBe(kinds)
  })
})
