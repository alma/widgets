import type { ConfigPlan, EligibilityPlan } from '../types'
import { WIDGET_CONFIG, USER_AGENT } from '../constants'
import { logger } from './logger'
import { hashStringForStorage, isMoreThanOneHourAgo } from './storage-hash'
import { getSharedFetch } from './shared-fetch'
/**
 * Generate a hashed cache key for eligibility data
 * Combines all request parameters to ensure cache hits are accurate
 * Uses hashing to create short, consistent keys
 */
const generateCacheKey = (
  merchantId: string,
  purchaseAmount: number,
  plans?: ConfigPlan[],
  customerBillingCountry?: string,
  customerShippingCountry?: string,
  merchantCoversAllFees?: boolean,
): string => {
  const planKey = plans ? JSON.stringify(plans) : 'default'
  const cacheString = `${merchantId}${purchaseAmount}${planKey}${customerBillingCountry || 'none'}${customerShippingCountry || 'none'}${merchantCoversAllFees ? 'yes' : 'no'}`
  return hashStringForStorage(cacheString)
}

interface CachedEligibility {
  data: EligibilityPlan[]
  timestamp: number
}

/**
 * Retrieve eligibility data from session cache if available and not expired
 * Cache expires after 1 hour
 */
const getCachedEligibility = (cacheKey: string): EligibilityPlan[] | null => {
  try {
    const cached = sessionStorage.getItem(`${WIDGET_CONFIG.SESSION_CACHE_PREFIX}${cacheKey}`)
    if (!cached) return null

    const parsed: CachedEligibility = JSON.parse(cached)

    // Check if cache is older than 1 hour
    if (isMoreThanOneHourAgo(parsed.timestamp)) {
      // Cache expired, remove it
      sessionStorage.removeItem(`${WIDGET_CONFIG.SESSION_CACHE_PREFIX}${cacheKey}`)
      return null
    }

    return parsed.data
  } catch (error) {
    logger.warn('Failed to read from session cache', { component: 'fetchEligibility' })
  }
  return null
}

/**
 * Store eligibility data in session cache with timestamp
 */
const cacheEligibility = (cacheKey: string, data: EligibilityPlan[]): void => {
  try {
    const cacheEntry: CachedEligibility = {
      data,
      timestamp: Date.now(),
    }
    sessionStorage.setItem(
      `${WIDGET_CONFIG.SESSION_CACHE_PREFIX}${cacheKey}`,
      JSON.stringify(cacheEntry),
    )
  } catch (error) {
    // Fail silently - cache is optional, don't break the widget if it fails
    logger.warn('Failed to write to session cache', { component: 'fetchEligibility' })
  }
}

/**
 * Fetches eligibility data from Alma API
 * Results are cached in sessionStorage to avoid repeated API calls
 * Cache expires after 1 hour or when cache key changes
 *
 * Multiple simultaneous requests with identical parameters share the same promise
 * to prevent duplicate API calls (e.g., when PaymentPlans and Modal load together)
 */
export async function fetchEligibility(
  apiUrl: string,
  merchantId: string,
  purchaseAmount: number,
  plans?: ConfigPlan[],
  customerBillingCountry?: string,
  customerShippingCountry?: string,
  merchantCoversAllFees?: boolean,
): Promise<EligibilityPlan[]> {
  const cacheKey = generateCacheKey(
    merchantId,
    purchaseAmount,
    plans,
    customerBillingCountry,
    customerShippingCountry,
    merchantCoversAllFees,
  )

  // Check session cache first
  const cached = getCachedEligibility(cacheKey)
  if (cached) {
    logger.info('Using cached eligibility data', { component: 'fetchEligibility' })
    return cached
  }

  // Use shared fetch promise: if another identical request is in flight,
  // return its promise instead of making another API call
  return getSharedFetch(`eligibility_${cacheKey}`, async () => {
    return performFetchEligibility(
      apiUrl,
      merchantId,
      purchaseAmount,
      plans,
      customerBillingCountry,
      customerShippingCountry,
      merchantCoversAllFees,
      cacheKey,
    )
  })
}

/**
 * Internal function that performs the actual API call
 * Only called once per unique request (via getSharedFetch)
 */
async function performFetchEligibility(
  apiUrl: string,
  merchantId: string,
  purchaseAmount: number,
  plans: ConfigPlan[] | undefined,
  customerBillingCountry: string | undefined,
  customerShippingCountry: string | undefined,
  merchantCoversAllFees: boolean | undefined,
  cacheKey: string,
): Promise<EligibilityPlan[]> {
  const url = `${apiUrl}/v2/payments/eligibility`

  const payload: any = {
    purchase_amount: purchaseAmount,
  }

  // Add installment queries if plans are specified
  if (plans && plans.length > 0) {
    payload.queries = plans.map((plan) => ({
      installments_count: plan.installmentsCount,
      deferred_days: plan.deferredDays,
      deferred_months: plan.deferredMonths,
    }))
  }

  // Add billing address if specified
  if (customerBillingCountry) {
    payload.billing_address = { country: customerBillingCountry }
  }

  // Add shipping address if specified
  if (customerShippingCountry) {
    payload.shipping_address = { country: customerShippingCountry }
  }

  // Add merchant covers fees if specified
  if (merchantCoversAllFees !== undefined) {
    payload.merchant_covers_all_fees = merchantCoversAllFees
  }

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Alma-Merchant-Auth ${merchantId}`,
        'X-Alma-Agent': USER_AGENT,
      },
      cache: 'no-store',
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorText = await response.text()
      logger.apiError(response.status, errorText, {
        component: 'fetchEligibility',
        method: 'fetch',
      })
      throw new Error(`API Error: ${response.status}`)
    }

    const data = await response.json()

    // Check for API error responses
    if (data && ('error_code' in data || 'errors' in data)) {
      logger.error('API returned error response', { component: 'fetchEligibility' })
      return []
    }

    // Cache successful response
    cacheEligibility(cacheKey, data)

    return data
  } catch (error) {
    logger.error(
      `Error fetching eligibility: ${error instanceof Error ? error.message : String(error)}`,
      {
        component: 'fetchEligibility',
      },
    )
    return []
  }
}
