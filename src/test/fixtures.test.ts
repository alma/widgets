import { mockDeferredP1XPlan, withCountry } from 'test/fixtures'

describe('withCountry', () => {
  it('should return a copy of the plan with transaction_country overridden', () => {
    expect(withCountry(mockDeferredP1XPlan, 'IT')).toEqual({
      ...mockDeferredP1XPlan,
      transaction_country: 'IT',
    })
  })

  it('should not mutate the given plan', () => {
    const plan = { ...mockDeferredP1XPlan }

    withCountry(plan, 'ES')

    expect(plan).toEqual(mockDeferredP1XPlan)
  })
})
