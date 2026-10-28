import type { MockInstance } from 'vitest'

import { createKey, setCache } from '@/domain/plans/api/eligibility-cache'
import { statusResponse } from '@/domain/plans/api/eligibility.const'
import type { EligibilityInput } from '@/domain/plans/api/eligibility.types'
import { getEligibility } from '@/domain/plans/api/get-eligibility'
import { BUILD_VERSION } from '@/shared/config/build-version.const'
import { fetchFromApi } from '@/shared/lib/http'
import { configPlans, mockP2XEligiblePlan, mockPlansAllEligible } from '@/test/fixtures'

vi.mock('@/shared/lib/http')

const HOUR = 3600000
const SANDBOX = 'https://api.sandbox.getalma.eu'

const input = (overrides: Partial<EligibilityInput> = {}): EligibilityInput => ({
  purchaseAmount: 45000,
  domain: SANDBOX,
  merchantId: 'test_id',
  customerBillingCountry: 'FR',
  customerShippingCountry: 'FR',
  ...overrides,
})

const FAILED = { status: statusResponse.FAILED, plans: [] }

const seed = (entry: unknown, overrides: Partial<EligibilityInput> = {}) =>
  sessionStorage.setItem(createKey(input(overrides)), JSON.stringify(entry))

describe('getEligibility', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('the cases of master', () => {
    it('should fetch eligibility data and update state', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      const result = await getEligibility(input({ merchantCoversAllFees: true }))

      expect(fetchFromApi).toHaveBeenCalledTimes(1)
      expect(fetchFromApi).toHaveBeenCalledWith({
        url: `${SANDBOX}/v2/payments/eligibility`,
        headers: {
          Authorization: 'Alma-Merchant-Auth test_id',
          // Master's jest run saw `undefined` here. The build defines the version.
          'X-Alma-Agent': `Alma Widget/${BUILD_VERSION}`,
        },
        body: {
          purchase_amount: 45000,
          queries: undefined,
          billing_address: { country: 'FR' },
          shipping_address: { country: 'FR' },
          merchant_covers_all_fees: true,
        },
      })
      // Raw, not filtered.
      expect(result).toEqual({ status: statusResponse.SUCCESS, plans: mockPlansAllEligible })
      expect(
        JSON.parse(sessionStorage.getItem(createKey(input({ merchantCoversAllFees: true })))!),
      ).toEqual({ value: mockPlansAllEligible, timestamp: Date.now() })
    })

    it('should use cached data if available to avoid calling fetch again', async () => {
      // One plan only, so the result can only come from the cache.
      const newMockedResult = [mockPlansAllEligible[0]]
      setCache(createKey(input()), newMockedResult)

      const result = await getEligibility(input())

      expect(result).toEqual({ status: statusResponse.SUCCESS, plans: newMockedResult })
      expect(fetchFromApi).not.toHaveBeenCalled()
    })

    it('should returns a FAILED status if the API response contains `error_code`', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue({ message: 'some error', error_code: '403' })

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(sessionStorage.length).toBe(0)
      expect(warn).not.toHaveBeenCalled()
    })

    it('should returns a FAILED status if the API response contains `errors`', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue({ errors: 'some error' })

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(sessionStorage.length).toBe(0)
      expect(warn).not.toHaveBeenCalled()
    })

    it('should return the transaction_country of the API, not the requested country', async () => {
      const planInItaly = mockP2XEligiblePlan.withCountry('IT')
      vi.mocked(fetchFromApi).mockResolvedValue([planInItaly])

      const result = await getEligibility(input({ configPlans }))

      expect(result.plans).toEqual([planInItaly])
    })
  })

  describe('cache age', () => {
    it('uses an entry that is 3599999 ms old', async () => {
      seed({ value: mockPlansAllEligible, timestamp: Date.now() - (HOUR - 1) })

      expect(await getEligibility(input())).toEqual({
        status: statusResponse.SUCCESS,
        plans: mockPlansAllEligible,
      })
      expect(fetchFromApi).not.toHaveBeenCalled()
    })

    it('uses an entry without timestamp, which never expires', async () => {
      seed({ value: mockPlansAllEligible })

      expect((await getEligibility(input())).status).toBe(statusResponse.SUCCESS)
      expect(fetchFromApi).not.toHaveBeenCalled()
    })

    it('clears the whole storage, sends no request and stays pending for an expired entry', async () => {
      seed({ value: mockPlansAllEligible, timestamp: Date.now() - HOUR })
      sessionStorage.setItem('merchant-cart', 'keep me')

      expect(await getEligibility(input())).toEqual({ status: statusResponse.PENDING, plans: [] })
      expect(sessionStorage.length).toBe(0)
      expect(fetchFromApi).not.toHaveBeenCalled()
    })

    it('sends the request after a clear when the expired entry has no value', async () => {
      seed({ timestamp: Date.now() - HOUR })
      sessionStorage.setItem('merchant-cart', 'keep me')
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      expect((await getEligibility(input())).status).toBe(statusResponse.SUCCESS)
      expect(fetchFromApi).toHaveBeenCalledTimes(1)
      expect(sessionStorage.length).toBe(1)
    })

    it('sends the request for an entry with an empty value, as master', async () => {
      seed(null)
      vi.mocked(fetchFromApi).mockResolvedValue([])

      expect(await getEligibility(input())).toEqual({ status: statusResponse.SUCCESS, plans: [] })
      expect(fetchFromApi).toHaveBeenCalledTimes(1)
    })
  })

  describe('responses', () => {
    it('caches an empty array and returns success', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue([])

      expect(await getEligibility(input())).toEqual({ status: statusResponse.SUCCESS, plans: [] })
      expect(sessionStorage.length).toBe(1)
    })

    it.each([
      ['a network error', new TypeError('Failed to fetch')],
      ['a body that is not JSON', new SyntaxError('Unexpected token <')],
    ])('fails quietly with no cache for %s', async (_, error) => {
      vi.mocked(fetchFromApi).mockRejectedValue(error)

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(sessionStorage.length).toBe(0)
      expect(warn).not.toHaveBeenCalled()
    })

    it.each([null, 42, 'text', true])(
      'fails quietly with no cache for the body %s',
      async (body) => {
        vi.mocked(fetchFromApi).mockResolvedValue(body)

        expect(await getEligibility(input())).toEqual(FAILED)
        expect(sessionStorage.length).toBe(0)
        expect(warn).not.toHaveBeenCalled()
      },
    )

    it('fails with one warning and no cache for an object that is not an array', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue({})

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(sessionStorage.length).toBe(0)
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn.mock.calls[0][0]).toMatch(/^\[Alma widgets\] /)
    })
  })

  describe('storage failures', () => {
    const securityError = new DOMException('The operation is insecure.', 'SecurityError')
    const throwing = () => {
      throw securityError
    }

    it('fails with one warning and sends no request when the read throws', async () => {
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(throwing)

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledWith(expect.stringMatching(/^\[Alma widgets\] /), securityError)
    })

    it('fails with one warning when the write throws, after one request', async () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      })
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(fetchFromApi).toHaveBeenCalledTimes(1)
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning when the clear of an expired entry throws', async () => {
      seed({ value: mockPlansAllEligible, timestamp: Date.now() - HOUR })
      vi.spyOn(Storage.prototype, 'clear').mockImplementation(throwing)

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning and sends no request for an entry that is not JSON', async () => {
      sessionStorage.setItem(createKey(input()), '{not json')

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning and sends no request for a value that is not an array', async () => {
      seed({ value: { installments_count: 3 }, timestamp: Date.now() })

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })
  })

  describe('options', () => {
    it.each([undefined, null])(
      'fails with one warning and sends no request for purchaseAmount %s',
      async (purchaseAmount) => {
        const result = await getEligibility(
          input({ purchaseAmount: purchaseAmount as unknown as number }),
        )

        expect(result).toEqual(FAILED)
        expect(fetchFromApi).not.toHaveBeenCalled()
        expect(warn).toHaveBeenCalledTimes(1)
      },
    )

    it('fails with one warning and sends no request when plans is an object', async () => {
      const plans = { installmentsCount: 3 } as unknown as EligibilityInput['configPlans']

      expect(await getEligibility(input({ configPlans: plans }))).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning and sends no request when a plan is not an object', async () => {
      const plans = [null] as unknown as EligibilityInput['configPlans']

      expect(await getEligibility(input({ configPlans: plans }))).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('works with plans: null as with missing plans, under its own key', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      expect((await getEligibility(input({ configPlans: null }))).status).toBe(
        statusResponse.SUCCESS,
      )
      expect(vi.mocked(fetchFromApi).mock.calls[0][0].body.queries).toBeUndefined()
      expect(sessionStorage.getItem(createKey(input({ configPlans: null })))).not.toBeNull()
    })
  })

  it('lets every call read the cache and send its own request', async () => {
    const answers: Array<(body: unknown) => void> = []
    vi.mocked(fetchFromApi).mockImplementation(
      () =>
        new Promise((resolve) => {
          answers.push(resolve)
        }),
    )

    // Identical requests in flight aren't merged, as on master.
    const pending = [getEligibility(input()), getEligibility(input())]
    expect(fetchFromApi).toHaveBeenCalledTimes(2)
    answers.forEach((answer) => answer(mockPlansAllEligible))
    await Promise.all(pending)

    // Once the cache holds the response, the next call sends no request.
    expect((await getEligibility(input())).status).toBe(statusResponse.SUCCESS)
    expect(fetchFromApi).toHaveBeenCalledTimes(2)
  })
})
