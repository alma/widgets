import type {
  EligibilityPlanBase,
  EligibleOnlyFields,
  IneligibleOnlyFields,
} from '@/domain/plans/api/eligibility.types'

export type ConfigPlan = {
  installmentsCount: number
  deferredDays?: number
  deferredMonths?: number
  minAmount: number
  maxAmount: number
}

// filterEligibility() recomputes `eligible` against the merchant's own plan config, so the
// result may no longer match either backend variant's exact field set
export type EligibilityPlanToDisplay = EligibilityPlanBase &
  Partial<EligibleOnlyFields> &
  Partial<IneligibleOnlyFields> & {
    eligible: boolean
    minAmount?: number
    maxAmount?: number
    hidden?: boolean
  }
