import type { EligibilityInput } from '@/domain/plans/api/eligibility.types'
import { BUILD_VERSION } from '@/shared/config/build-version.const'
import type { ApiRequest } from '@/shared/lib/http.types'

const buildAddress = (country?: string) => (country ? { country } : null)

// Master's request, byte for byte: the body keys keep its order, and JSON.stringify drops the
// undefined ones. Expects `configPlans` to be an array or missing.
export const buildEligibilityRequest = ({
  purchaseAmount,
  domain,
  merchantId,
  configPlans,
  customerBillingCountry,
  customerShippingCountry,
  merchantCoversAllFees,
}: EligibilityInput): ApiRequest => ({
  url: `${domain}/v2/payments/eligibility`,
  headers: {
    Authorization: `Alma-Merchant-Auth ${merchantId}`,
    'X-Alma-Agent': `Alma Widget/${BUILD_VERSION}`,
  },
  body: {
    purchase_amount: purchaseAmount,
    queries: configPlans?.map((plan) => ({
      installments_count: plan.installmentsCount,
      deferred_days: plan.deferredDays,
      deferred_months: plan.deferredMonths,
    })),
    billing_address: buildAddress(customerBillingCountry),
    shipping_address: buildAddress(customerShippingCountry),
    merchant_covers_all_fees: merchantCoversAllFees,
  },
})
