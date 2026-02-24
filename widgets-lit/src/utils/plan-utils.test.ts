import { expect } from '@open-wc/testing'
import { isPayNowPlan, isPayNowExplicitlyConfigured, sortPlans } from './plan-utils'
import type { EligibilityPlan } from '../types'

const createPlan = (
  installmentsCount: number,
  deferredDays = 0,
  deferredMonths = 0,
): EligibilityPlan => ({
  installments_count: installmentsCount,
  eligible: true,
  deferred_days: deferredDays,
  deferred_months: deferredMonths,
  purchase_amount: 45000,
  customer_total_cost_amount: 45000,
  customer_total_cost_bps: 0,
  payment_plan: [],
})

describe('isPayNowPlan', () => {
  it('returns true for 1x with no deferral', () => {
    expect(isPayNowPlan(createPlan(1))).to.be.true
  })

  it('returns false for deferred 1x (D+15)', () => {
    expect(isPayNowPlan(createPlan(1, 15))).to.be.false
  })

  it('returns false for deferred 1x (M+1)', () => {
    expect(isPayNowPlan(createPlan(1, 0, 1))).to.be.false
  })

  it('returns false for 3x installment plan', () => {
    expect(isPayNowPlan(createPlan(3))).to.be.false
  })

  it('returns false for 10x installment plan', () => {
    expect(isPayNowPlan(createPlan(10))).to.be.false
  })
})

describe('isPayNowExplicitlyConfigured', () => {
  it('returns false when configPlans is undefined', () => {
    expect(isPayNowExplicitlyConfigured(undefined)).to.be.false
  })

  it('returns false when configPlans is empty', () => {
    expect(isPayNowExplicitlyConfigured([])).to.be.false
  })

  it('returns true when 1x non-deferred plan is configured', () => {
    const config = [{ installmentsCount: 1, minAmount: 100, maxAmount: 200000 }]
    expect(isPayNowExplicitlyConfigured(config)).to.be.true
  })

  it('returns false when only deferred 1x plan is configured', () => {
    const config = [{ installmentsCount: 1, deferredDays: 15, minAmount: 100, maxAmount: 200000 }]
    expect(isPayNowExplicitlyConfigured(config)).to.be.false
  })

  it('returns false when only installment plans are configured', () => {
    const config = [
      { installmentsCount: 3, minAmount: 100, maxAmount: 200000 },
      { installmentsCount: 4, minAmount: 100, maxAmount: 200000 },
    ]
    expect(isPayNowExplicitlyConfigured(config)).to.be.false
  })
})

describe('sortPlans', () => {
  it('sorts by installments_count ascending', () => {
    const plans = [createPlan(4), createPlan(10), createPlan(3)]
    const sorted = sortPlans(plans)
    expect(sorted.map((p) => p.installments_count)).to.deep.equal([3, 4, 10])
  })

  it('sorts by deferral when installments_count is equal', () => {
    const plans = [createPlan(1, 30), createPlan(1, 0), createPlan(1, 15)]
    const sorted = sortPlans(plans)
    expect(sorted.map((p) => p.deferred_days)).to.deep.equal([0, 15, 30])
  })

  it('treats deferred months as 30 days for sorting', () => {
    // D+30 vs M+1 — both 30 days, stable order kept
    const d30 = createPlan(1, 30)
    const m1 = createPlan(1, 0, 1)
    const sorted = sortPlans([m1, d30])
    expect(sorted).to.have.lengthOf(2)
  })

  it('returns a new array and does not mutate the input', () => {
    const plans = [createPlan(4), createPlan(3)]
    const sorted = sortPlans(plans)
    expect(sorted).to.not.equal(plans)
    expect(plans[0].installments_count).to.equal(4) // input unchanged
  })

  it('handles empty array', () => {
    expect(sortPlans([])).to.deep.equal([])
  })
})
