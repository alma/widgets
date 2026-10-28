import { html } from 'lit'
import type { MockInstance } from 'vitest'

import {
  type ConfigPlan,
  createKey,
  type EligibilityPlan,
  filterEligibility,
  setCache,
  statusResponse,
} from '@/domain/plans'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import {
  configPlans,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures'
import { EligibilityController } from '@/widgets/common/eligibility.controller'

const SANDBOX = 'https://api.sandbox.getalma.eu'

class TestEligibilityHost extends LightDomElement {
  purchaseAmount = 45000

  apiData = { domain: SANDBOX, merchantId: 'test_id' }

  configPlans?: ConfigPlan[] | null

  customerBillingCountry? = 'FR'

  customerShippingCountry? = 'FR'

  merchantCoversAllFees?: boolean

  eligibility = new EligibilityController(this)

  protected override render() {
    return html`<p>${this.eligibility.status}:${this.eligibility.plans.length}</p>`
  }
}
customElements.define('test-eligibility-host', TestEligibilityHost)

const createHost = (overrides: Partial<TestEligibilityHost> = {}) => {
  const host = document.createElement('test-eligibility-host') as TestEligibilityHost
  Object.assign(host, overrides)
  return host
}

const mountHost = (overrides: Partial<TestEligibilityHost> = {}) => {
  const host = createHost(overrides)
  document.body.append(host)
  return host
}

const keyOf = (host: TestEligibilityHost) =>
  createKey({ ...host, ...host.apiData, configPlans: host.configPlans })

// A fetch stub that waits until the test answers. The controller sends its request on a
// microtask, so an answer also goes to the requests sent after it.
const stubApi = () => {
  const waiting: Array<(response: Response) => void> = []
  let reply: { body: unknown } | undefined
  const fetchMock = vi.fn(
    (_url: string, _init: RequestInit) =>
      new Promise<Response>((resolve) => {
        if (reply) {
          resolve(Response.json(reply.body))
        } else {
          waiting.push(resolve)
        }
      }),
  )
  vi.stubGlobal('fetch', fetchMock)
  return {
    fetchMock,
    answer: (body: unknown) => {
      reply = { body }
      waiting.splice(0).forEach((resolve) => resolve(Response.json(body)))
    },
  }
}

const settled = (host: TestEligibilityHost) =>
  vi.waitFor(() => expect(host.eligibility.status).not.toBe(statusResponse.PENDING))

describe('EligibilityController', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('the cases of master', () => {
    it('should fetch eligibility data and update state', async () => {
      const api = stubApi()
      const host = mountHost({ merchantCoversAllFees: true })

      expect(host.eligibility.status).toBe(statusResponse.PENDING)
      expect(host.textContent).toBe('pending:0')
      await vi.waitFor(() => expect(api.fetchMock).toHaveBeenCalledTimes(1))

      api.answer(mockPlansAllEligible)
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(host.eligibility.plans).toEqual(filterEligibility(mockPlansAllEligible))
      await host.updateComplete
      expect(host.textContent).toBe(`success:${host.eligibility.plans.length}`)
      expect(JSON.parse(sessionStorage.getItem(keyOf(host))!).value).toEqual(mockPlansAllEligible)
    })

    it('should use cached data if available to avoid calling fetch again', async () => {
      const api = stubApi()
      // One plan only, so the result can only come from the cache.
      const newMockedResult = [mockPlansAllEligible[1]]
      setCache(keyOf(createHost()), newMockedResult)

      const host = mountHost()
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(host.eligibility.plans).toEqual(filterEligibility(newMockedResult))
      expect(api.fetchMock).not.toHaveBeenCalled()
    })

    it.each([
      ['error_code', { message: 'some error', error_code: '403' }],
      ['errors', { errors: 'some error' }],
    ])('should returns a FAILED status if the API response contains `%s`', async (_, body) => {
      const api = stubApi()
      const host = mountHost()

      api.answer(body)
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.FAILED)
      expect(sessionStorage.length).toBe(0)
      expect(host.eligibility.plans).toEqual([])
    })

    it('should expose the transaction_country returned by the API, not the requested country', async () => {
      // The addresses are French, so `IT` can only come from the response.
      const planInItaly = mockP2XEligiblePlan.withCountry('IT')
      const api = stubApi()
      // With `configPlans`, the filter rebuilds each plan object.
      const host = mountHost({ configPlans })

      api.answer([planInItaly])
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(host.eligibility.plans).toHaveLength(1)
      expect(host.eligibility.plans[0].transaction_country).toBe('IT')
    })
  })

  it('filters the plans in the API order, then sorts them with days before months', async () => {
    const api = stubApi()
    const host = mountHost()

    const apiOrder: EligibilityPlan[] = [
      mockP3XEligiblePlanWithFees,
      mockPayLaterOneMonthEligiblePlan,
      mockP1XEligiblePlan,
      mockP2XEligiblePlan,
      mockPayLater30DaysEligiblePlan,
    ]
    api.answer(apiOrder)
    await settled(host)

    // Without plans, the filter drops P1X.
    expect(host.eligibility.plans).toEqual([
      mockPayLater30DaysEligiblePlan,
      mockPayLaterOneMonthEligiblePlan,
      mockP2XEligiblePlan,
      mockP3XEligiblePlanWithFees,
    ])
  })

  describe('lifecycle', () => {
    it('lets a removed host finish its request and write the cache, then shows it once back', async () => {
      const api = stubApi()
      const host = mountHost()
      host.remove()

      api.answer(mockPlansAllEligible)
      await vi.waitFor(() => expect(sessionStorage.getItem(keyOf(host))).not.toBeNull())
      expect(warn).not.toHaveBeenCalled()

      document.body.append(host)
      await settled(host)
      await host.updateComplete
      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(host.textContent).toBe(`success:${host.eligibility.plans.length}`)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
    })

    it('shows the result of a request that ends after the host is put back', async () => {
      const api = stubApi()
      const host = mountHost()
      host.remove()
      document.body.append(host)

      api.answer(mockPlansAllEligible)
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
    })

    it('sends no new request when the host is put back after success', async () => {
      const api = stubApi()
      const host = mountHost()
      api.answer(mockPlansAllEligible)
      await settled(host)

      host.remove()
      document.body.append(host)
      host.requestUpdate()
      await host.updateComplete

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
    })

    it('uses the properties set right after the host is appended', async () => {
      const api = stubApi()
      const host = createHost({ purchaseAmount: undefined as unknown as number })
      document.body.append(host)
      host.purchaseAmount = 30000
      host.merchantCoversAllFees = true

      api.answer(mockPlansAllEligible)
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
      expect(JSON.parse(api.fetchMock.mock.calls[0][1].body as string)).toMatchObject({
        purchase_amount: 30000,
        merchant_covers_all_fees: true,
      })
      expect(warn).not.toHaveBeenCalled()
    })

    it('sends no new request when a property changes after success, as master', async () => {
      const api = stubApi()
      const host = mountHost()
      api.answer(mockPlansAllEligible)
      await settled(host)

      host.purchaseAmount = 90000
      host.requestUpdate()
      await host.updateComplete

      expect(host.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
    })

    it('lets each new host read the cache, and does not merge requests in flight', async () => {
      const api = stubApi()
      const first = mountHost()
      const second = mountHost()
      await vi.waitFor(() => expect(api.fetchMock).toHaveBeenCalledTimes(2))

      api.answer(mockPlansAllEligible)
      await settled(first)
      await settled(second)

      const third = mountHost()
      await settled(third)
      expect(third.eligibility.status).toBe(statusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(2)
    })
  })

  describe('failures', () => {
    it('fails with one warning and sends no request when sessionStorage throws on read', async () => {
      const api = stubApi()
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new DOMException('The operation is insecure.', 'SecurityError')
      })

      const host = mountHost()
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.FAILED)
      expect(api.fetchMock).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning when sessionStorage throws on write', async () => {
      const api = stubApi()
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
      })

      const host = mountHost()
      api.answer(mockPlansAllEligible)
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.FAILED)
      expect(host.eligibility.plans).toEqual([])
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning when the response holds plans that the filter cannot read', async () => {
      const api = stubApi()
      // With plans, the filter reads the fields of each plan.
      const host = mountHost({ configPlans })

      api.answer([null])
      await settled(host)

      expect(host.eligibility.status).toBe(statusResponse.FAILED)
      expect(host.eligibility.plans).toEqual([])
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning and sends no request without apiData', async () => {
      const api = stubApi()
      const host = mountHost({ apiData: undefined })
      await settled(host)
      await host.updateComplete

      expect(host.eligibility.status).toBe(statusResponse.FAILED)
      expect(host.textContent).toBe('failed:0')
      expect(api.fetchMock).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('stays pending after it clears an expired entry', async () => {
      const api = stubApi()
      const host = createHost()
      sessionStorage.setItem(
        keyOf(host),
        JSON.stringify({ value: mockPlansAllEligible, timestamp: Date.now() - 3600000 }),
      )

      document.body.append(host)
      await host.updateComplete
      await vi.waitFor(() => expect(sessionStorage.length).toBe(0))

      expect(host.eligibility.status).toBe(statusResponse.PENDING)
      expect(api.fetchMock).not.toHaveBeenCalled()
    })
  })
})
