import type { MockInstance } from 'vitest'

import { createKey, setCache } from '@/domain/api/eligibility-cache'
import { buildEligibilityRequest } from '@/domain/api/eligibility-request-builder'
import { StatusResponse } from '@/domain/api/eligibility.const'
import type { EligibilityInput } from '@/domain/api/eligibility.types'
import { getEligibility } from '@/domain/api/get-eligibility'
import { fetchFromApi } from '@/lib/http'
import { mockPlansAllEligible } from '@/test/fixtures/plans'

vi.mock('@/lib/http')

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

const FAILED = { status: StatusResponse.FAILED, plans: [] }

const seed = (entry: unknown, overrides: Partial<EligibilityInput> = {}) =>
  sessionStorage.setItem(createKey(input(overrides)), JSON.stringify(entry))

describe('getEligibility', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  describe('main cases', () => {
    it('should fetch eligibility data and update state', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      const result = await getEligibility(input({ merchantCoversAllFees: true }))

      expect(fetchFromApi).toHaveBeenCalledTimes(1)
      expect(fetchFromApi).toHaveBeenCalledWith(
        buildEligibilityRequest(input({ merchantCoversAllFees: true })),
      )
      // Raw, not filtered.
      expect(result).toEqual({ status: StatusResponse.SUCCESS, plans: mockPlansAllEligible })
      expect(
        JSON.parse(sessionStorage.getItem(createKey(input({ merchantCoversAllFees: true })))!),
      ).toEqual({ value: mockPlansAllEligible, timestamp: Date.now() })
    })

    it('should use cached data if available to avoid calling fetch again', async () => {
      // One plan only, so the result can only come from the cache.
      const newMockedResult = [mockPlansAllEligible[0]]
      setCache(createKey(input()), newMockedResult)

      const result = await getEligibility(input())

      expect(result).toEqual({ status: StatusResponse.SUCCESS, plans: newMockedResult })
      expect(fetchFromApi).not.toHaveBeenCalled()
    })
  })

  describe('cache age', () => {
    it('uses an entry without timestamp, which never expires', async () => {
      seed({ value: mockPlansAllEligible })

      expect((await getEligibility(input())).status).toBe(StatusResponse.SUCCESS)
      expect(fetchFromApi).not.toHaveBeenCalled()
    })

    it('sends no request and stays pending for an expired entry', async () => {
      seed({ value: mockPlansAllEligible, timestamp: Date.now() - HOUR })

      expect(await getEligibility(input())).toEqual({ status: StatusResponse.PENDING, plans: [] })
      expect(fetchFromApi).not.toHaveBeenCalled()
    })

    it('sends the request when the expired entry has no value', async () => {
      seed({ timestamp: Date.now() - HOUR })
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      expect((await getEligibility(input())).status).toBe(StatusResponse.SUCCESS)
      expect(fetchFromApi).toHaveBeenCalledTimes(1)
    })

    it('sends the request for an entry with an empty value', async () => {
      seed(null)
      vi.mocked(fetchFromApi).mockResolvedValue([])

      expect(await getEligibility(input())).toEqual({ status: StatusResponse.SUCCESS, plans: [] })
      expect(fetchFromApi).toHaveBeenCalledTimes(1)
    })
  })

  describe('responses', () => {
    it('caches an empty array and returns success', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue([])

      expect(await getEligibility(input())).toEqual({ status: StatusResponse.SUCCESS, plans: [] })
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

    it.each([
      { message: 'some error', error_code: '403' },
      { errors: 'some error' },
      null,
      42,
      'text',
      true,
    ])('fails quietly with no cache for the body %j', async (body) => {
      vi.mocked(fetchFromApi).mockResolvedValue(body)

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(sessionStorage.length).toBe(0)
      expect(warn).not.toHaveBeenCalled()
    })

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

    it('fails with one warning and sends no request for a value that is not an array', async () => {
      seed({ value: { installments_count: 3 }, timestamp: Date.now() })

      expect(await getEligibility(input())).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })
  })

  describe('options', () => {
    it.each([
      ['purchaseAmount undefined', { purchaseAmount: undefined }],
      ['purchaseAmount null', { purchaseAmount: null }],
      ['plans that are an object', { configPlans: { installmentsCount: 3 } }],
      ['a plan that is not an object', { configPlans: [null] }],
    ])('fails with one warning and sends no request for %s', async (_, overrides) => {
      const result = await getEligibility(input(overrides as unknown as Partial<EligibilityInput>))

      expect(result).toEqual(FAILED)
      expect(fetchFromApi).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('works with plans: null as with missing plans', async () => {
      vi.mocked(fetchFromApi).mockResolvedValue(mockPlansAllEligible)

      expect((await getEligibility(input({ configPlans: null }))).status).toBe(
        StatusResponse.SUCCESS,
      )
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

    // Identical requests in flight aren't merged.
    const pending = [getEligibility(input()), getEligibility(input())]
    expect(fetchFromApi).toHaveBeenCalledTimes(2)
    answers.forEach((answer) => answer(mockPlansAllEligible))
    await Promise.all(pending)

    // Once the cache holds the response, the next call sends no request.
    expect((await getEligibility(input())).status).toBe(StatusResponse.SUCCESS)
    expect(fetchFromApi).toHaveBeenCalledTimes(2)
  })
})
