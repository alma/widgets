import {
  mockDisplayPlansAllEligible,
  mockDisplayPlansNoneEligible,
  mockDisplayPlansOneEligible,
  mockP10XBelowMinDisplayPlan,
  mockP4XAboveMaxDisplayPlan,
} from '@/test/fixtures'

describe('the display fixtures', () => {
  it('should limit the 4x plan to the maximum of the API', () => {
    expect(mockP4XAboveMaxDisplayPlan).toMatchObject({
      installments_count: 4,
      eligible: false,
      maxAmount: 20000,
    })
  })

  it('should raise the 10x plan to the minimum of the API', () => {
    expect(mockP10XBelowMinDisplayPlan).toMatchObject({
      installments_count: 10,
      eligible: false,
      minAmount: 90000,
    })
  })

  it.each([
    ['no plan', mockDisplayPlansNoneEligible, 0],
    ['one plan', mockDisplayPlansOneEligible, 1],
    ['every plan', mockDisplayPlansAllEligible, mockDisplayPlansAllEligible.length],
  ])('should make %s eligible', (_, plans, eligibleCount) => {
    expect(plans.filter((plan) => plan.eligible)).toHaveLength(eligibleCount)
  })
})
