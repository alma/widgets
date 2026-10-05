import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'

// Sort by installments count, then deferred days before deferred months (P1X, J+15, J+30, M+1, 2x…)
const sortEligibility = (plans: EligibilityPlanToDisplay[]): EligibilityPlanToDisplay[] =>
  [...plans].sort(
    (a, b) =>
      a.installments_count - b.installments_count ||
      a.deferred_months - b.deferred_months ||
      a.deferred_days - b.deferred_days,
  )

export default sortEligibility
