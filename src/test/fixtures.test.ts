import { mockPayLater30DaysEligiblePlan, withCountry } from 'test/fixtures'

describe('withCountry', () => {
  it('should return a copy of the plan with transaction_country overridden', () => {
    expect(withCountry(mockPayLater30DaysEligiblePlan, 'IT')).toEqual({
      ...mockPayLater30DaysEligiblePlan,
      transaction_country: 'IT',
    })
  })

  it('should not mutate the given plan', () => {
    const plan = { ...mockPayLater30DaysEligiblePlan }

    withCountry(plan, 'ES')

    expect(plan).toEqual(mockPayLater30DaysEligiblePlan)
  })
})
