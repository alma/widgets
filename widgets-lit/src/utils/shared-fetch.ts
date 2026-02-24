/**
 * Shared Fetch Promise Utility
 *
 * PURPOSE: Prevent duplicate simultaneous API calls for identical parameters
 *
 * PROBLEM:
 * When multiple widgets (PaymentPlans + Modal) load simultaneously with the same
 * parameters, they each make separate API calls to the same endpoint.
 * This wastes bandwidth and causes redundant network requests.
 *
 * SOLUTION:
 * Maintain a global Map of in-flight fetch promises. When multiple components
 * request data with the same cache key at the same time, they all receive the
 * same promise and therefore share the result of a single API call.
 *
 * VISUAL FLOW:
 * ┌─ Request 1 for "eligibility_450"
 * │  └─ Not in Map → Execute API call → Store promise
 * │  └─ Wait for API → Get result
 * │
 * ├─ Request 2 for "eligibility_450" (simultaneous)
 * │  └─ Found in Map! → Return same promise
 * │  └─ Wait for same API → Get same result
 * │
 * └─ Request 3 for "eligibility_450" (simultaneous)
 *    └─ Found in Map! → Return same promise
 *    └─ Wait for same API → Get same result
 *
 * RESULT: 1 API call for 3 requests (savings: 66%)
 *
 * REAL WORLD EXAMPLE:
 * User loads product page with both PaymentPlans and Modal widgets
 * 1. PaymentPlans.connectedCallback() calls fetchEligibility(purchaseAmount: 450)
 *    └─ Cache key: "eligibility_abc123_450_..."
 *    └─ Not in flight yet → Makes API call
 * 2. Modal.connectedCallback() calls fetchEligibility(purchaseAmount: 450)
 *    └─ Cache key: "eligibility_abc123_450_..." (SAME KEY!)
 *    └─ Already in flight! → Returns PaymentPlans' promise
 * 3. Both widgets get data from same API call ✅
 */

interface FetchPromiseEntry {
  promise: Promise<any>
  timestamp: number
}

// Global map of in-flight fetch promises
// Key: cache key (e.g., "eligibility_merchant123_amount450_plans3x4x")
// Value: { promise: Promise being executed, timestamp: when it started }
//
// When a request comes in with a matching key, we return the existing promise
// instead of starting a new API call. This deduplicates requests.
const fetchPromises = new Map<string, FetchPromiseEntry>()

/**
 * Execute a fetch operation with shared promise caching
 *
 * ALGORITHM:
 * 1. Check if a request with this exact cache key is already in progress
 * 2. If YES → Return the existing promise (caller will wait for it)
 * 3. If NO → Execute the fetch function and store its promise
 * 4. When complete (success or error) → Remove from Map
 *
 * This ensures that:
 * • Identical simultaneous requests share a single API call
 * • Different requests (different cache keys) execute independently
 * • Subsequent requests after completion get fresh promises/API calls
 *
 * TYPE SAFETY: Generic <T> ensures TypeScript knows what the promise resolves to
 *
 * @param cacheKey - Unique identifier for this request
 *                   Must include all parameters that affect the result
 *                   Example: "eligibility_merchant123_amount450_plans3x4x"
 *                   Two requests with different amounts should have different keys
 * @param fetchFn - Async function that performs the actual API call
 *                  Should return the desired data (eligibility plans, etc)
 *                  Only executed if this is the first request with this cache key
 * @returns Promise that resolves with the fetch result
 *         Multiple callers with the same cacheKey will return the same promise
 *         and therefore share the result
 */
export async function getSharedFetch<T>(cacheKey: string, fetchFn: () => Promise<T>): Promise<T> {
  const existing = fetchPromises.get(cacheKey)
  if (existing) {
    return existing.promise as Promise<T>
  }

  const promise = fetchFn().finally(() => {
    // Always clean up so a later call can start a fresh request.
    fetchPromises.delete(cacheKey)
  })

  fetchPromises.set(cacheKey, {
    promise,
    timestamp: Date.now(),
  })

  return promise
}

/**
 * Clear all pending fetch promises
 *
 * WHEN TO USE:
 * • Testing: Reset state between test cases
 * • Error recovery: Force fresh API calls after a failure
 * • Manual reset: Clear cache if needed by application logic
 * • Logout/session change: Clear cached requests when context changes
 *
 * BEHAVIOR AFTER CLEARING:
 * After calling this, all in-flight promises are removed from the Map.
 * If a request comes in with the same cache key afterward, a fresh
 * API call will be made (instead of reusing an old promise).
 * This is useful if authentication changed or data became invalid.
 */
export function clearSharedFetches(): void {
  fetchPromises.clear()
}
