import { CACHE_TTL_MS } from '@/domain/plans/api/eligibility.const'
import type { EligibilityInput, EligibilityPlan } from '@/domain/plans/api/eligibility.types'
import { BUILD_VERSION } from '@/shared/config/build-version.const'
import { hashStringForStorage } from '@/shared/lib/hash'

export const isMoreThanOneHourAgo = (date: number): boolean => Date.now() - date >= CACHE_TTL_MS

// Master's key: a missing value prints as `undefined`, and the build version invalidates the
// entries of older releases. Expects `purchaseAmount` to be set.
export const createKey = ({
  purchaseAmount,
  configPlans,
  customerBillingCountry,
  customerShippingCountry,
  merchantCoversAllFees,
  domain,
  merchantId,
}: EligibilityInput): string => {
  const stringAmount = purchaseAmount.toString()
  const stringPlans = JSON.stringify(configPlans)
  return hashStringForStorage(
    `${domain}${merchantId}${stringAmount}${stringPlans}${customerBillingCountry}${customerShippingCountry}${merchantCoversAllFees}${BUILD_VERSION}`,
  )
}

// These throw, like master's. getEligibility() catches every error.

// Any JSON value, unchecked, or null when there is no entry.
export const getCache = (key: string): unknown => {
  const stringData = sessionStorage.getItem(key)
  return stringData ? JSON.parse(stringData) : null
}

export const setCache = (key: string, value: EligibilityPlan[]): void => {
  sessionStorage.setItem(key, JSON.stringify({ value, timestamp: Date.now() }))
}

export const deleteCache = (key: string): void => {
  sessionStorage.removeItem(key)
}

// Removes every key, the merchant's too, as master does.
export const clearCache = (): void => {
  sessionStorage.clear()
}
