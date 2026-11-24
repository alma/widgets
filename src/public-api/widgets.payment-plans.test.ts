import { http, HttpResponse } from 'msw'

import { ApiMode, Widgets } from '@/index'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import {
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
} from '@/test/fixtures/plans'
import { ELIGIBILITY_ENDPOINT } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { useListenerSpies } from '@/test/utils/listener-spies'
import { TEST_CONTAINER, TEST_MERCHANT_ID } from '@/test/utils/mount-widget'

const threePlans = [mockP2XEligiblePlan, mockP3XEligiblePlanWithFees, mockP4XEligiblePlanWithFees]

// The live widget's cycling and announcements all end within this time.
const SETTLE_MS = 60000

const addPaymentPlans = (options: Partial<PaymentPlanWidgetOptions> = {}) =>
  Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST).add(Widgets.PaymentPlans, {
    container: TEST_CONTAINER,
    purchaseAmount: 45000,
    locale: 'fr',
    ...options,
  } as PaymentPlanWidgetOptions)

describe('add(PaymentPlans)', () => {
  let container: HTMLElement
  let requestBodies: unknown[]

  const planButtons = () => container.querySelectorAll('[role="option"]')
  const whenRendered = () => vi.waitFor(() => expect(planButtons()).toHaveLength(3))

  beforeEach(() => {
    requestBodies = []
    server.use(
      http.post(ELIGIBILITY_ENDPOINT, async ({ request }) => {
        requestBodies.push(await request.json())
        return HttpResponse.json(threePlans)
      }),
    )
    container = document.createElement('div')
    container.id = TEST_CONTAINER.slice(1)
    document.body.append(container)
  })

  describe('a second add() on the same container', () => {
    it('should send one more request, with the new amount', async () => {
      addPaymentPlans()
      await whenRendered()

      addPaymentPlans({ purchaseAmount: 30000 })
      await vi.waitFor(() => expect(requestBodies).toHaveLength(2))
      await whenRendered()

      expect(requestBodies).toHaveLength(2)
      expect(requestBodies[1]).toMatchObject({ purchase_amount: 30000 })
    })
  })

  describe('leaks', () => {
    const spies = useListenerSpies()

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should leave no listener and no timer after three add() calls', async () => {
      vi.useFakeTimers({
        toFake: [
          'setTimeout',
          'clearTimeout',
          'setInterval',
          'clearInterval',
          'requestAnimationFrame',
          'cancelAnimationFrame',
        ],
      })
      addPaymentPlans()
      await whenRendered()
      addPaymentPlans({ purchaseAmount: 30000 })
      await vi.advanceTimersByTimeAsync(500)
      addPaymentPlans()
      await whenRendered()
      await vi.advanceTimersByTimeAsync(SETTLE_MS)

      expect(spies.attached()).toEqual({})
      expect(vi.getTimerCount()).toBe(0)
    })
  })
})
