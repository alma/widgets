import { EligibilityPlanToDisplay } from '@/types'
import { getDeferredDays } from '@/utils'

// Sort by installments count, then by deferral (P1X, J+15, J+30, 2x, 3x…)
const sortEligibility = (plans: EligibilityPlanToDisplay[]): EligibilityPlanToDisplay[] =>
  [...plans].sort(
    (a, b) =>
      a.installments_count - b.installments_count ||
      getDeferredDays(a.deferred_months, a.deferred_days) -
        getDeferredDays(b.deferred_months, b.deferred_days),
  )

export default sortEligibility
