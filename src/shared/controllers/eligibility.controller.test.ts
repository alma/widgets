import { html } from 'lit'
import type { MockInstance } from 'vitest'

import { createKey } from '@/domain/api/eligibility-cache'
import { StatusResponse } from '@/domain/api/eligibility.const'
import type { ConfigPlan, EligibilityPlan } from '@/domain/plans.types'
import { EligibilityController } from '@/shared/controllers/eligibility.controller'
import { LightDomElement } from '@/shared/custom-elements/light-dom-element'
import {
  configPlans,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
  mockPlansAllEligible,
} from '@/test/fixtures/plans'

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
  vi.waitFor(() => expect(host.eligibility.status).not.toBe(StatusResponse.PENDING))

describe('EligibilityController', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('main cases', () => {
    it('should fetch eligibility data and update state', async () => {
      const api = stubApi()
      const host = mountHost({ merchantCoversAllFees: true })

      expect(host.eligibility.status).toBe(StatusResponse.PENDING)
      expect(host.textContent).toBe('pending:0')
      await vi.waitFor(() => expect(api.fetchMock).toHaveBeenCalledTimes(1))

      api.answer(mockPlansAllEligible)
      await settled(host)

      expect(host.eligibility.status).toBe(StatusResponse.SUCCESS)
      // Without a plans option, the P1X plan is dropped.
      expect(host.eligibility.plans).toEqual([
        mockPayLaterOneMonthEligiblePlan,
        mockP2XEligiblePlan,
        mockP3XEligiblePlanWithFees,
        mockP4XEligiblePlanWithFees,
        mockP10XEligiblePlan,
      ])
      await host.updateComplete
      expect(host.textContent).toBe(`success:${host.eligibility.plans.length}`)
    })

    it('should returns a FAILED status if the API response contains `error_code`', async () => {
      const api = stubApi()
      const host = mountHost()

      api.answer({ message: 'some error', error_code: '403' })
      await settled(host)

      expect(host.eligibility.status).toBe(StatusResponse.FAILED)
      expect(host.eligibility.plans).toEqual([])
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
      expect(host.eligibility.status).toBe(StatusResponse.SUCCESS)
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

      expect(host.eligibility.status).toBe(StatusResponse.SUCCESS)
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

      expect(host.eligibility.status).toBe(StatusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
      expect(JSON.parse(api.fetchMock.mock.calls[0][1].body as string)).toMatchObject({
        purchase_amount: 30000,
        merchant_covers_all_fees: true,
      })
      expect(warn).not.toHaveBeenCalled()
    })

    it('sends no new request when a property changes after success', async () => {
      const api = stubApi()
      const host = mountHost()
      api.answer(mockPlansAllEligible)
      await settled(host)

      host.purchaseAmount = 90000
      host.requestUpdate()
      await host.updateComplete

      expect(host.eligibility.status).toBe(StatusResponse.SUCCESS)
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
    })

    it('filters the response again with the plans the host has now, on each render', async () => {
      const api = stubApi()
      const host = mountHost({ configPlans })
      api.answer(mockPlansAllEligible)
      await settled(host)
      const [first] = configPlans

      host.configPlans = [first]

      // Only the P1X plan has a matching config plan, so only it stays shown.
      expect(host.eligibility.plans.map(({ hidden }) => hidden)).toEqual([
        false,
        true,
        true,
        true,
        true,
        true,
      ])
      expect(api.fetchMock).toHaveBeenCalledTimes(1)
    })
  })

  describe('failures', () => {
    it('fails with one warning when the response holds plans that the filter cannot read', async () => {
      const api = stubApi()
      // With plans, the filter reads the fields of each plan.
      const host = mountHost({ configPlans })

      api.answer([null])
      await settled(host)

      expect(host.eligibility.status).toBe(StatusResponse.FAILED)
      expect(host.eligibility.plans).toEqual([])
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('fails with one warning and sends no request without apiData', async () => {
      const api = stubApi()
      const host = mountHost({ apiData: undefined })
      await settled(host)
      await host.updateComplete

      expect(host.eligibility.status).toBe(StatusResponse.FAILED)
      expect(host.textContent).toBe('failed:0')
      expect(api.fetchMock).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledTimes(1)
    })
  })
})
