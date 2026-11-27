import * as Alma from '@/index'
import { ApiMode, Utils, Widgets } from '@/index'
import { formatCents, priceFromCents, priceToCents } from '@/lib/price'
import { TEST_MERCHANT_ID } from '@/test/utils/mount-widget'

describe('Alma', () => {
  describe('ApiMode', () => {
    // A wrong LIVE URL hides every widget on every merchant page.
    it('should hold the live and sandbox API URLs only', () => {
      expect(ApiMode).toStrictEqual({
        LIVE: 'https://api.getalma.eu',
        TEST: 'https://api.sandbox.getalma.eu',
      })
    })
  })

  describe('Widgets', () => {
    it('should hold initialize and the two widget names only', () => {
      expect(new Set(Object.keys(Widgets))).toEqual(
        new Set(['initialize', 'PaymentPlans', 'Modal']),
      )
      expect(Widgets.initialize).toBeInstanceOf(Function)
      expect(Widgets.PaymentPlans).toBe('PaymentPlans')
      expect(Widgets.Modal).toBe('Modal')
    })

    it('should make initialize() return an object whose only key is add', () => {
      expect(Object.keys(Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST))).toEqual(['add'])
    })
  })

  describe('Utils', () => {
    it('should hold the three price functions of lib/price only', () => {
      expect(Utils).toStrictEqual({ priceToCents, priceFromCents, formatCents })
    })
  })

  // A real ES namespace sorts its keys, so their order on window.Alma is the bundle's to check.
  it('should export Widgets, Utils and ApiMode only', () => {
    expect(new Set(Object.keys(Alma))).toEqual(new Set(['Widgets', 'Utils', 'ApiMode']))
  })
})
