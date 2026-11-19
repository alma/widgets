import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { beforeAll, describe, expect } from 'vitest'

import { mockEligibilityApi } from './support/api-mock'
import { it } from './support/contract-test'
import { loadUmd } from './support/load-bundle'
import {
  addWidget,
  closeButton,
  MERCHANT_ID,
  planButtons,
  tick,
  useFakeClock,
  waitFor,
} from './support/page'

const threePlans = JSON.parse(
  readFileSync(resolve(__dirname, 'fixtures/eligibility/eligible-2x-3x-4x.json'), 'utf8'),
)

let Alma: ReturnType<typeof loadUmd>
beforeAll(() => {
  Alma = loadUmd()
})

useFakeClock()

const renderPlans = async (options: Record<string, unknown> | undefined, mode?: string) => {
  const api = mockEligibilityApi({ json: threePlans })
  addWidget(Alma, Alma.Widgets.PaymentPlans, options ?? {}, { mode })
  await waitFor(() => planButtons().length > 0, 'the plan buttons')
  return api
}

const bodyOf = async (options: Record<string, unknown>) => {
  // The response may match none of the plans, so wait for the request, not for the buttons.
  const api = mockEligibilityApi({ json: threePlans })
  addWidget(Alma, Alma.Widgets.PaymentPlans, options)
  await waitFor(() => api.calls.length > 0, 'the request')
  expect(api.calls).toHaveLength(1)
  return api.calls[0].rawBody
}

describe('eligibility request', () => {
  describe('URL', () => {
    it('posts to the live API with ApiMode.LIVE', async () => {
      const api = await renderPlans(undefined, Alma.ApiMode.LIVE)
      expect(api.calls.map(({ url }) => url)).toEqual([
        'https://api.getalma.eu/v2/payments/eligibility',
      ])
    })

    it('posts to the sandbox API with ApiMode.TEST', async () => {
      const api = await renderPlans(undefined, Alma.ApiMode.TEST)
      expect(api.calls.map(({ url }) => url)).toEqual([
        'https://api.sandbox.getalma.eu/v2/payments/eligibility',
      ])
    })

    // Master uses the mode string as a prefix as it is, so a custom string works too.
    it('uses a custom mode string as the prefix', async () => {
      const api = await renderPlans(undefined, 'https://example.test')
      expect(api.calls.map(({ url }) => url)).toEqual([
        'https://example.test/v2/payments/eligibility',
      ])
    })
  })

  describe('init', () => {
    it('sends a POST with force-cache', async () => {
      const api = await renderPlans(undefined)
      expect(api.calls[0].method).toBe('POST')
      expect(api.calls[0].cache).toBe('force-cache')
    })

    it('sends the three headers and no other', async () => {
      const api = await renderPlans(undefined)
      expect(api.calls[0].headers).toEqual({
        'content-type': 'application/json',
        authorization: `Alma-Merchant-Auth ${MERCHANT_ID}`,
        'x-alma-agent': 'Alma Widget/contract-test',
      })
    })
  })

  // Master sends the keys in a fixed order, so these tests compare the exact string.
  describe('body', () => {
    it('sends null addresses and no queries when only the amount is set', async () => {
      expect(await bodyOf({ purchaseAmount: 45000 })).toBe(
        '{"purchase_amount":45000,"billing_address":null,"shipping_address":null}',
      )
    })

    it('sends the plans, both countries and merchantCoversAllFees', async () => {
      expect(
        await bodyOf({
          plans: [
            { installmentsCount: 3, minAmount: 5000, maxAmount: 200000 },
            { installmentsCount: 1, deferredDays: 15, minAmount: 5000, maxAmount: 200000 },
          ],
          customerBillingCountry: 'fr',
          customerShippingCountry: 'de',
          merchantCoversAllFees: false,
        }),
      ).toBe(
        '{"purchase_amount":45000,"queries":[{"installments_count":3},{"installments_count":1,"deferred_days":15}],"billing_address":{"country":"fr"},"shipping_address":{"country":"de"},"merchant_covers_all_fees":false}',
      )
    })

    it('sends merchant_covers_all_fees true', async () => {
      expect(await bodyOf({ merchantCoversAllFees: true })).toBe(
        '{"purchase_amount":45000,"billing_address":null,"shipping_address":null,"merchant_covers_all_fees":true}',
      )
    })

    it('sends deferred_months', async () => {
      expect(
        await bodyOf({
          plans: [{ installmentsCount: 1, deferredMonths: 1, minAmount: 5000, maxAmount: 200000 }],
        }),
      ).toBe(
        '{"purchase_amount":45000,"queries":[{"installments_count":1,"deferred_months":1}],"billing_address":null,"shipping_address":null}',
      )
    })

    it('sends null for an empty string country', async () => {
      expect(await bodyOf({ customerBillingCountry: '', customerShippingCountry: '' })).toBe(
        '{"purchase_amount":45000,"billing_address":null,"shipping_address":null}',
      )
    })

    // Master doesn't convert the amount, so a numeric string stays a string in the body.
    it('sends a numeric string purchaseAmount as a string', async () => {
      expect(await bodyOf({ purchaseAmount: '45000' })).toBe(
        '{"purchase_amount":"45000","billing_address":null,"shipping_address":null}',
      )
    })
  })

  describe('count', () => {
    it('sends one request for one add(PaymentPlans)', async () => {
      const api = await renderPlans(undefined)
      await tick(5000)
      expect(api.calls).toHaveLength(1)
    })

    it('sends none for add(Modal) until the first open(), then one', async () => {
      const api = mockEligibilityApi({ json: threePlans })
      const handle = addWidget(Alma, Alma.Widgets.Modal) as { open: () => void }
      await tick(1000)
      expect(api.calls).toHaveLength(0)

      handle.open()
      await waitFor(() => closeButton() !== null, 'the modal')
      await tick(500)
      expect(api.calls).toHaveLength(1)
    })

    it('makes no other network call in the 60 s after render', async () => {
      const open = vi.spyOn(XMLHttpRequest.prototype, 'open')
      const sendBeacon = vi.fn()
      Object.defineProperty(navigator, 'sendBeacon', {
        configurable: true,
        writable: true,
        value: sendBeacon,
      })
      const imageSrc = vi.spyOn(HTMLImageElement.prototype, 'src', 'set')

      const api = await renderPlans(undefined)
      await tick(60000)

      expect(api.calls).toHaveLength(1)
      expect(open).not.toHaveBeenCalled()
      expect(sendBeacon).not.toHaveBeenCalled()
      expect(imageSrc).not.toHaveBeenCalled()

      open.mockRestore()
      imageSrc.mockRestore()
      Reflect.deleteProperty(navigator, 'sendBeacon')
    })
  })
})
