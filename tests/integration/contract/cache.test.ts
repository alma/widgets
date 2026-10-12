import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { cacheKey } from './support/cache-key'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'
import {
  addAgain,
  addWidget,
  closeButton,
  MERCHANT_ID,
  planButtons,
  START,
  tick,
  useFakeClock,
  waitFor,
} from './support/page'

const fixture = (name: string) =>
  JSON.parse(readFileSync(resolve(__dirname, `fixtures/eligibility/${name}.json`), 'utf8'))

const threePlans = fixture('eligible-2x-3x-4x')

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

const HOUR = 3600000
const TEST_DOMAIN = 'https://api.sandbox.getalma.eu'
const plans = [
  { installmentsCount: 2, minAmount: 100, maxAmount: 200000 },
  { installmentsCount: 3, minAmount: 100, maxAmount: 200000 },
  { installmentsCount: 4, minAmount: 100, maxAmount: 200000 },
]
const options = { purchaseAmount: 45000, plans }
const keyOf = (overrides: Parameters<typeof cacheKey>[0] = { purchaseAmount: 45000, plans }) =>
  cacheKey({ domain: TEST_DOMAIN, merchantId: MERCHANT_ID, ...overrides })

const entries = () =>
  Object.fromEntries(
    Array.from({ length: sessionStorage.length }, (_, index) => {
      const key = sessionStorage.key(index) as string
      return [key, JSON.parse(sessionStorage.getItem(key) as string)]
    }),
  )

const renderPlans = async (json: unknown = threePlans) => {
  const api = mockEligibilityApi({ json })
  addWidget(Alma, Alma.Widgets.PaymentPlans, options)
  await waitFor(() => planButtons().length > 0, 'the plan buttons')
  return api
}

const seed = (key: string, age: number) =>
  sessionStorage.setItem(key, JSON.stringify({ value: threePlans, timestamp: Date.now() - age }))

describe('eligibility cache', () => {
  describe('key and value', () => {
    it('writes one entry under the key that master computes', async () => {
      await renderPlans()
      expect(Object.keys(entries())).toEqual([keyOf()])
    })

    it('stores the response with the write time', async () => {
      await tick(1234)
      await renderPlans()
      const entry = entries()[keyOf()]
      expect(entry.value).toEqual(threePlans)
      // The clock is fake, so the write time is the time of the response, a few ms after the add().
      expect(entry.timestamp).toBeGreaterThanOrEqual(START + 1234)
      expect(entry.timestamp).toBeLessThanOrEqual(Date.now())
    })

    it('puts the countries, the fee option and a custom mode in the key, and not the locale', async () => {
      const parts = {
        purchaseAmount: 45000,
        plans,
        customerBillingCountry: 'fr',
        customerShippingCountry: 'de',
        merchantCoversAllFees: true,
      }
      mockEligibilityApi({ json: threePlans })
      addWidget(Alma, Alma.Widgets.PaymentPlans, { ...parts, locale: 'fr' })
      await waitFor(() => planButtons().length > 0, 'the plan buttons')
      expect(Object.keys(entries())).toEqual([keyOf(parts)])
    })

    // A missing value enters the key as the text "undefined".
    it('writes the key with the text undefined for missing options', async () => {
      mockEligibilityApi({ json: threePlans })
      addWidget(Alma, Alma.Widgets.PaymentPlans, { purchaseAmount: 45000 })
      await waitFor(() => planButtons().length > 0, 'the plan buttons')
      expect(Object.keys(entries())).toEqual([keyOf({ purchaseAmount: 45000 })])
      expect(keyOf({ purchaseAmount: 45000 })).not.toBe(keyOf())
    })
  })

  describe('hit', () => {
    it('sends no request for a second add() with the same options', async () => {
      const api = await renderPlans()
      document.body.innerHTML = '<div id="alma-widget"></div>'
      addAgain(Alma, Alma.Widgets.PaymentPlans, options)
      await waitFor(() => planButtons().length > 0, 'the plan buttons')
      expect(api.calls).toHaveLength(1)
    })

    it('sends no request for a second open() of the modal after a close', async () => {
      const api = mockEligibilityApi({ json: threePlans })
      const handle = addWidget(Alma, Alma.Widgets.Modal, options) as {
        open: () => void
      }
      handle.open()
      await waitFor(() => closeButton() !== null, 'the modal')
      await tick(500)
      ;(closeButton() as HTMLElement).click()
      await waitFor(() => closeButton() === null, 'the modal to close')

      handle.open()
      await waitFor(() => closeButton() !== null, 'the modal')
      await tick(500)
      expect(api.calls).toHaveLength(1)
    })
  })

  describe('age', () => {
    it('uses an entry that is 3599999 ms old', async () => {
      seed(keyOf(), HOUR - 1)
      const api = mockEligibilityApi({ json: threePlans })
      addWidget(Alma, Alma.Widgets.PaymentPlans, options)
      await waitFor(() => planButtons().length > 0, 'the plan buttons')
      expect(api.calls).toHaveLength(0)
    })

    // This records master as it is. An entry that is 3600000 ms old has expired, and master then
    // calls sessionStorage.clear(), which also removes the merchant's own keys, and sends no
    // request. The widget stays on its loader until the next add().
    it('clears the whole storage and stays loading for an entry that is 3600000 ms old', async () => {
      seed(keyOf(), HOUR)
      sessionStorage.setItem('merchant-cart', 'keep me')
      const api = mockEligibilityApi({ json: threePlans })
      addWidget(Alma, Alma.Widgets.PaymentPlans, options)
      await tick(5000)

      expect(sessionStorage.length).toBe(0)
      expect(api.calls).toHaveLength(0)
      expect(planButtons()).toHaveLength(0)

      addAgain(Alma, Alma.Widgets.PaymentPlans, options)
      await waitFor(() => planButtons().length > 0, 'the plan buttons')
      expect(api.calls).toHaveLength(1)
    })
  })

  describe('build version', () => {
    it('ignores an entry stored under another build version', async () => {
      seed(keyOf({ purchaseAmount: 45000, plans, buildVersion: 'dev' }), 0)
      const api = await renderPlans()
      expect(api.calls).toHaveLength(1)
    })
  })

  describe('writes', () => {
    const noEntry = async (reply: Parameters<typeof mockEligibilityApi>[0]) => {
      const api = mockEligibilityApi(reply)
      addWidget(Alma, Alma.Widgets.PaymentPlans, options)
      await tick(5000)
      expect(api.calls).toHaveLength(1)
      expect(sessionStorage.length).toBe(0)
    }

    it('writes no entry when the request fails', () => noEntry({ networkError: true }))

    it('writes no entry for an error_code response', () =>
      noEntry({ json: fixture('error-unauthorized') }))

    it('writes no entry for an errors response', () => noEntry({ json: fixture('errors-empty') }))

    it('writes an entry for a 200 with an empty array', async () => {
      mockEligibilityApi({ json: fixture('empty') })
      addWidget(Alma, Alma.Widgets.PaymentPlans, options)
      await tick(5000)
      expect(entries()[keyOf()]).toMatchObject({ value: [] })
      expect(sessionStorage.length).toBe(1)
    })
  })
})
