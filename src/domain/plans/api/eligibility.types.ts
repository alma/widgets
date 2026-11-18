import type { statusResponse } from '@/domain/plans/api/eligibility.const'
import type { ConfigPlan, EligibilityPlan } from '@/domain/plans/plans.types'

// `configPlans` is the merchant's `plans` option as given: the cache key depends on its key order.
export type EligibilityInput = {
  purchaseAmount: number
  domain: string
  merchantId: string
  configPlans?: ConfigPlan[] | null
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
}

// Raw API plans, before the filter and the sort. Empty unless the status is success.
export type EligibilityResult = {
  status: statusResponse
  plans: EligibilityPlan[]
}
