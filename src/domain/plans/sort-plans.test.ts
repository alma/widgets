import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import sortEligibility from '@/domain/plans/sort-plans'

const plan = (installmentsCount: number, deferredDays = 0, deferredMonths = 0) =>
  ({
    installments_count: installmentsCount,
    deferred_days: deferredDays,
    deferred_months: deferredMonths,
  }) as EligibilityPlanToDisplay

describe('sortEligibility', () => {
  it('sorts by installments count, then deferred days before deferred months', () => {
    const plans = [
      plan(4),
      plan(1, 0, 1),
      plan(1, 30),
      plan(10),
      plan(2),
      plan(1, 18),
      plan(3),
      plan(1),
      plan(1, 15),
    ]

    expect(sortEligibility(plans)).toEqual([
      plan(1),
      plan(1, 15),
      plan(1, 18),
      plan(1, 30),
      plan(1, 0, 1),
      plan(2),
      plan(3),
      plan(4),
      plan(10),
    ])
  })
})
