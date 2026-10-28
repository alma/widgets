import { buildEligibilityRequest } from '@/domain/plans/api/eligibility-api'
import type { EligibilityInput } from '@/domain/plans/api/eligibility.types'
import { BUILD_VERSION } from '@/shared/config/build-version.const'

const input = (overrides: Partial<EligibilityInput> = {}): EligibilityInput => ({
  domain: 'https://api.sandbox.getalma.eu',
  merchantId: 'merchant_id',
  purchaseAmount: 45000,
  ...overrides,
})

// The strings that master sends, key order included.
const bodyOf = (overrides: Partial<EligibilityInput> = {}) =>
  JSON.stringify(buildEligibilityRequest(input(overrides)).body)

describe('buildEligibilityRequest', () => {
  it('posts to the eligibility path of the domain', () => {
    expect(buildEligibilityRequest(input()).url).toBe(
      'https://api.sandbox.getalma.eu/v2/payments/eligibility',
    )
    expect(buildEligibilityRequest(input({ domain: 'https://example.test' })).url).toBe(
      'https://example.test/v2/payments/eligibility',
    )
  })

  it('sends the merchant and the build version in the headers', () => {
    expect(buildEligibilityRequest(input()).headers).toEqual({
      Authorization: 'Alma-Merchant-Auth merchant_id',
      'X-Alma-Agent': `Alma Widget/${BUILD_VERSION}`,
    })
  })

  it('sends null addresses and no queries when only the amount is set', () => {
    expect(bodyOf()).toBe(
      '{"purchase_amount":45000,"billing_address":null,"shipping_address":null}',
    )
  })

  it('sends the plans, both countries and merchantCoversAllFees', () => {
    expect(
      bodyOf({
        configPlans: [
          { installmentsCount: 3, minAmount: 5000, maxAmount: 200000 },
          { installmentsCount: 1, deferredDays: 15, minAmount: 5000, maxAmount: 200000 },
          { installmentsCount: 1, deferredMonths: 1, minAmount: 5000, maxAmount: 200000 },
        ],
        customerBillingCountry: 'fr',
        customerShippingCountry: 'de',
        merchantCoversAllFees: false,
      }),
    ).toBe(
      '{"purchase_amount":45000,"queries":[{"installments_count":3},{"installments_count":1,"deferred_days":15},{"installments_count":1,"deferred_months":1}],"billing_address":{"country":"fr"},"shipping_address":{"country":"de"},"merchant_covers_all_fees":false}',
    )
  })

  it('sends no queries for plans: null, as for missing plans', () => {
    expect(bodyOf({ configPlans: null })).toBe(bodyOf())
  })

  it('sends null for an empty string country', () => {
    expect(bodyOf({ customerBillingCountry: '', customerShippingCountry: '' })).toBe(bodyOf())
  })

  it('sends the amount as given', () => {
    expect(bodyOf({ purchaseAmount: '45000' as unknown as number })).toBe(
      '{"purchase_amount":"45000","billing_address":null,"shipping_address":null}',
    )
    expect(bodyOf({ purchaseAmount: NaN })).toBe(
      '{"purchase_amount":null,"billing_address":null,"shipping_address":null}',
    )
  })
})
