import { buildEligibilityRequest } from '@/domain/plans/api/eligibility-api'
import {
  clearCache,
  createKey,
  getCache,
  isMoreThanOneHourAgo,
  setCache,
} from '@/domain/plans/api/eligibility-cache'
import { statusResponse } from '@/domain/plans/api/eligibility.const'
import type { EligibilityInput, EligibilityResult } from '@/domain/plans/api/eligibility.types'
import { warnOnce } from '@/shared/lib/errors'
import { fetchFromApi } from '@/shared/lib/http'

const FAILED: EligibilityResult = { status: statusResponse.FAILED, plans: [] }
const PENDING: EligibilityResult = { status: statusResponse.PENDING, plans: [] }

// Where master throws, the port warns once and fails.
const fail = (message: string, error?: unknown): EligibilityResult => {
  warnOnce(message, error)
  return FAILED
}

const readEntryField = (entry: unknown, field: 'value' | 'timestamp'): unknown =>
  entry !== null && typeof entry === 'object'
    ? (entry as Record<string, unknown>)[field]
    : undefined

const requestEligibility = async (input: EligibilityInput): Promise<EligibilityResult> => {
  let request
  try {
    request = buildEligibilityRequest(input)
  } catch (error) {
    return fail('The eligibility request could not be built.', error)
  }
  let response: unknown
  try {
    response = await fetchFromApi<unknown>(request)
  } catch {
    // Network error or non-JSON body: master fails quietly too.
    return FAILED
  }
  // Master fails quietly on these too: its `in` check throws on null and other primitives.
  if (
    response === null ||
    typeof response !== 'object' ||
    'error_code' in response ||
    'errors' in response
  ) {
    return FAILED
  }
  if (!Array.isArray(response)) {
    return fail('The eligibility API returned an unexpected response.')
  }
  return { status: statusResponse.SUCCESS, plans: response }
}

// The cached result, or null when the request must go out.
// For an expired entry, clears all of sessionStorage, as master does.
const readCachedEligibility = (key: string): EligibilityResult | null => {
  let cachedEntry: unknown
  try {
    cachedEntry = getCache(key)
  } catch (error) {
    return fail('The eligibility cache could not be read.', error)
  }
  const cached = readEntryField(cachedEntry, 'value')
  const timestamp = readEntryField(cachedEntry, 'timestamp')
  // An entry without a timestamp never expires, as on master.
  const expired = Boolean(timestamp) && isMoreThanOneHourAgo(timestamp as number)

  if (expired) {
    try {
      clearCache()
    } catch (error) {
      return fail('The eligibility cache could not be cleared.', error)
    }
    // Master sends no request here and keeps loading until the next widget.
    if (cached) {
      return PENDING
    }
  } else if (cached) {
    if (!Array.isArray(cached)) {
      return fail('The eligibility cache entry is malformed.')
    }
    return { status: statusResponse.SUCCESS, plans: cached }
  }

  return null
}

// Master's cache-first lookup. Never rejects. A sent request always finishes and writes the cache.
export const getEligibility = async (input: EligibilityInput): Promise<EligibilityResult> => {
  const { purchaseAmount, configPlans } = input
  // The merchant's options arrive unchecked.
  if (purchaseAmount === undefined || purchaseAmount === null) {
    return fail('The purchaseAmount option is missing.')
  }
  if (configPlans !== undefined && configPlans !== null && !Array.isArray(configPlans)) {
    return fail('The plans option must be an array.')
  }

  let key: string
  try {
    key = createKey(input)
  } catch (error) {
    return fail('The eligibility cache key could not be built.', error)
  }

  const cachedResult = readCachedEligibility(key)
  if (cachedResult) {
    return cachedResult
  }

  const result = await requestEligibility(input)
  if (result.status !== statusResponse.SUCCESS) {
    return result
  }

  try {
    setCache(key, result.plans)
  } catch (error) {
    return fail('The eligibility response could not be cached.', error)
  }

  return result
}
