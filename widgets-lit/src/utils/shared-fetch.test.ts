import { expect } from '@open-wc/testing'
import { getSharedFetch, clearSharedFetches } from '../utils/shared-fetch'

/**
 * Unit tests for shared fetch promise utility
 *
 * This utility prevents duplicate simultaneous API calls by sharing promises.
 * When multiple components request the same data at the same time,
 * only ONE API call is made and all components share the result.
 *
 * Example use case:
 *   - PaymentPlans widget loads data from API
 *   - Modal widget (simultaneously) also loads the same data
 *   - Both use getSharedFetch with same cache key
 *   - Result: 1 API call, 2 data loads (from same promise)
 */
describe('Shared Fetch Promise Utility', () => {
  // Clean up after each test
  afterEach(() => {
    clearSharedFetches()
  })

  describe('getSharedFetch', () => {
    it('should execute a fetch function once for a unique key', async () => {
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        return { data: 'result' }
      }

      const result = await getSharedFetch('unique-key', mockFetch)

      expect(result).to.deep.equal({ data: 'result' })
      expect(callCount).to.equal(1)
    })

    it('should share promise for simultaneous identical requests', async () => {
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 50))
        return { data: 'shared-result' }
      }

      // Simulate two widgets requesting same data simultaneously
      // This is the core optimization: both get the SAME promise
      const [result1, result2, result3] = await Promise.all([
        getSharedFetch('payment-data-450', mockFetch),
        getSharedFetch('payment-data-450', mockFetch),
        getSharedFetch('payment-data-450', mockFetch),
      ])

      // All three get the same result
      expect(result1).to.deep.equal({ data: 'shared-result' })
      expect(result2).to.deep.equal({ data: 'shared-result' })
      expect(result3).to.deep.equal({ data: 'shared-result' })

      // But fetchFn was only called ONCE (not 3 times)
      // This is the benefit: eliminates duplicate API calls
      expect(callCount).to.equal(1)
    })

    it('should allow different keys to execute separately', async () => {
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        return { data: 'result' }
      }

      // Different cache keys = different requests = different API calls
      await Promise.all([
        getSharedFetch('key-450', mockFetch),
        getSharedFetch('key-600', mockFetch),
        getSharedFetch('key-900', mockFetch),
      ])

      // Each unique key triggers its own fetch
      expect(callCount).to.equal(3)
    })

    it('should propagate errors to all waiting requests', async () => {
      const testError = new Error('API failed')
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        throw testError
      }

      // All requests with same key should get same error
      const results = await Promise.allSettled([
        getSharedFetch('error-key', mockFetch),
        getSharedFetch('error-key', mockFetch),
        getSharedFetch('error-key', mockFetch),
      ])

      // All should be rejected
      expect(results.every((r) => r.status === 'rejected')).to.be.true

      // But fetch was only called once
      expect(callCount).to.equal(1)

      // All got the same error
      results.forEach((result) => {
        if (result.status === 'rejected') {
          expect(result.reason).to.equal(testError)
        }
      })
    })

    it('should clean up after successful completion', async () => {
      const mockFetch = async () => ({ data: 'result' })

      // First request
      const result1 = await getSharedFetch('cleanup-test', mockFetch)
      expect(result1).to.deep.equal({ data: 'result' })

      // After cleanup, same key should execute again (not return old promise)
      let secondCallExecuted = false
      const mockFetch2 = async () => {
        secondCallExecuted = true
        return { data: 'result-2' }
      }

      const result2 = await getSharedFetch('cleanup-test', mockFetch2)

      // Second request should have executed the new function
      expect(secondCallExecuted).to.be.true
      expect(result2).to.deep.equal({ data: 'result-2' })
    })

    it('should clean up even when request fails', async () => {
      const mockFetch = async () => {
        throw new Error('Request failed')
      }

      // Make first request (will fail)
      try {
        await getSharedFetch('error-cleanup', mockFetch)
      } catch {
        // Expected to throw
      }

      // After cleanup, same key should try again with new function
      let retryExecuted = false
      const mockRetry = async () => {
        retryExecuted = true
        return { data: 'retry-success' }
      }

      const result = await getSharedFetch('error-cleanup', mockRetry)

      // Retry should have executed
      expect(retryExecuted).to.be.true
      expect(result).to.deep.equal({ data: 'retry-success' })
    })

    it('should handle rapid sequential requests (different keys)', async () => {
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        return { index: callCount }
      }

      // Make multiple requests quickly with different keys
      const results = await Promise.all([
        getSharedFetch('rapid-1', mockFetch),
        getSharedFetch('rapid-2', mockFetch),
        getSharedFetch('rapid-3', mockFetch),
      ])

      // Each should have gotten its own result
      expect(results[0]).to.deep.equal({ index: 1 })
      expect(results[1]).to.deep.equal({ index: 2 })
      expect(results[2]).to.deep.equal({ index: 3 })

      // Each unique key triggered its own fetch
      expect(callCount).to.equal(3)
    })

    it('should handle mixed scenario (some shared, some unique)', async () => {
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        return { call: callCount }
      }

      // Make requests: 3 with key-A, 2 with key-B, 2 with key-A
      const results = await Promise.all([
        getSharedFetch('key-A', mockFetch), // Call 1
        getSharedFetch('key-B', mockFetch), // Call 2
        getSharedFetch('key-A', mockFetch), // Shares Call 1
        getSharedFetch('key-A', mockFetch), // Shares Call 1
        getSharedFetch('key-B', mockFetch), // Shares Call 2
      ])

      // First key-A and key-B got unique results
      // Others shared those results
      const keyAResults = [results[0], results[2], results[3]]
      const keyBResults = [results[1], results[4]]

      // All key-A requests got same result (call 1)
      expect(keyAResults.every((r) => r.call === 1)).to.be.true

      // All key-B requests got same result (call 2)
      expect(keyBResults.every((r) => r.call === 2)).to.be.true

      // Only 2 actual fetch calls (despite 5 requests)
      expect(callCount).to.equal(2)
    })

    it('should work with complex data types', async () => {
      const complexData = {
        plans: [
          { id: 1, name: '3x', amount: 150 },
          { id: 2, name: '4x', amount: 112.5 },
        ],
        merchant: 'merchant_123',
        timestamp: Date.now(),
      }

      const mockFetch = async () => complexData

      const [result1, result2] = await Promise.all([
        getSharedFetch('complex-data', mockFetch),
        getSharedFetch('complex-data', mockFetch),
      ])

      // Both should get the same complex object
      expect(result1).to.deep.equal(complexData)
      expect(result2).to.deep.equal(complexData)
      expect(result1).to.equal(result2) // Same reference
    })

    it('should execute again after the shared promise resolved (no stale reuse)', async () => {
      let callCount = 0
      const mockFetch = async () => {
        callCount++
        return { callCount }
      }

      const result1 = await getSharedFetch('same-key', mockFetch)
      expect(result1).to.deep.equal({ callCount: 1 })

      const result2 = await getSharedFetch('same-key', mockFetch)
      expect(result2).to.deep.equal({ callCount: 2 })

      expect(callCount).to.equal(2)
    })
  })

  describe('clearSharedFetches', () => {
    it('should clear all pending fetch promises', async () => {
      const slowFetch = async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { data: 'slow' }
      }

      // Start a slow fetch but don't await it
      getSharedFetch('slow-key', slowFetch) // Promise started but not awaited

      // Clear all pending fetches
      clearSharedFetches()

      // Making a new request with the same key should start fresh
      // (not return the old promise)
      let newFetchCalled = false
      const newFetch = async () => {
        newFetchCalled = true
        return { data: 'new' }
      }

      await getSharedFetch('slow-key', newFetch)

      // The new fetch should have been called
      expect(newFetchCalled).to.be.true
    })
  })

  /**
   * REAL-WORLD SCENARIO TEST
   *
   * This test demonstrates the actual use case:
   * PaymentPlans and Modal widgets loading simultaneously
   */
  describe('Real-world scenario: PaymentPlans + Modal loading together', () => {
    it('should prevent duplicate API calls when both widgets load', async () => {
      let apiCallCount = 0

      // Simulate fetchEligibility API call
      const fetchEligibilityAPI = async () => {
        apiCallCount++
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 50))
        return [
          { installmentsCount: 3, monthlyAmount: 150 },
          { installmentsCount: 4, monthlyAmount: 112.5 },
        ]
      }

      // Both widgets start loading at the same time with same cache key
      const cacheKey = 'eligibility_450euros'

      const [paymentPlansData, modalData] = await Promise.all([
        // PaymentPlans widget loads
        getSharedFetch(cacheKey, fetchEligibilityAPI),
        // Modal widget loads (simultaneously)
        getSharedFetch(cacheKey, fetchEligibilityAPI),
      ])

      // Both widgets got the data
      expect(paymentPlansData).to.have.lengthOf(2)
      expect(modalData).to.have.lengthOf(2)

      // But only ONE API call was made!
      // This is the optimization benefit
      expect(apiCallCount).to.equal(1)

      // Both got the same data
      expect(paymentPlansData).to.deep.equal(modalData)
    })

    it('should make separate calls when purchase amount changes', async () => {
      let apiCallCount = 0

      const fetchEligibilityAPI = async () => {
        apiCallCount++
        return { amount: 'varied' }
      }

      // Initial load: €450
      await getSharedFetch('eligibility_450', fetchEligibilityAPI)

      // User changes amount to €600
      // Both widgets update, call with new cache key
      await Promise.all([
        getSharedFetch('eligibility_600', fetchEligibilityAPI),
        getSharedFetch('eligibility_600', fetchEligibilityAPI),
      ])

      // Should be 2 API calls total:
      // 1 for €450 (shared between 1+ widgets)
      // 1 for €600 (shared between widgets)
      expect(apiCallCount).to.equal(2)
    })
  })

  // NOTE: We intentionally don't unit-test the inert fallback behavior here.
  // The web-test-runner DOM environment may throw "Illegal invocation" when
  // monkey-patching HTMLElement.prototype.
  // The modal integration tests cover open/close behavior end-to-end.
})
