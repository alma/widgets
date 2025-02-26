import { useEffect, useState } from 'react'

import { ApiConfig, ConfigPlan, EligibilityPlan, statusResponse } from '@/types'
import { useSessionStorage } from 'hooks/useSessionStorage'
import { fetchFromApi } from 'utils/fetch'
import filterEligibility from 'utils/filterEligibility'
import { isMoreThanOneHourAgo } from 'utils/utilsForStorage'

const useFetchEligibility = (
  purchaseAmount: number,
  { domain, merchantId }: ApiConfig,
  plans?: ConfigPlan[],
  customerBillingCountry?: string,
  customerShippingCountry?: string,
): [EligibilityPlan[], statusResponse] => {
  const [eligibility, setEligibility] = useState([] as EligibilityPlan[])
  const [status, setStatus] = useState(statusResponse.PENDING)

  // caching
  const { getCache, setCache, createKey, clearCache } = useSessionStorage()
  const key = createKey({
    purchaseAmount,
    plans,
    customerBillingCountry,
    customerShippingCountry,
    domain,
    merchantId,
  })
  const currentCache = getCache(key)?.value
  const lastCacheTimestamp = getCache(key)?.timestamp
  // If the stored date is more than an hour ago, we should invalidate the cache
  const shouldInvalidate = lastCacheTimestamp && isMoreThanOneHourAgo(lastCacheTimestamp)

  const configInstallments = plans?.map((plan) => ({
    installments_count: plan.installmentsCount,
    deferred_days: plan?.deferredDays,
    deferred_months: plan?.deferredMonths,
  }))
  useEffect(() => {
    if (status === statusResponse.PENDING) {
      let billingAddress = null
      if (customerBillingCountry) {
        billingAddress = {
          country: customerBillingCountry,
        }
      }

      let shippingAddress = null
      if (customerShippingCountry) {
        shippingAddress = {
          country: customerShippingCountry,
        }
      }
      if (currentCache && !shouldInvalidate) {
        setEligibility(currentCache)
        setStatus(statusResponse.SUCCESS)
      }
      if (shouldInvalidate) {
        // If we should invalidate, we clear all cache
        clearCache()
      }
      if (!currentCache) {
        // Fetch eligibility from API
        fetchFromApi(
          {
            purchase_amount: purchaseAmount,
            queries: configInstallments,
            billing_address: billingAddress,
            shipping_address: shippingAddress,
          },
          {
            Authorization: `Alma-Merchant-Auth ${merchantId}`,
            'X-Alma-Agent': `Alma Widget/${process.env.BUILD_VERSION}`,
          },
          `${domain}/v2/payments/eligibility`,
        )
          .then((res) => {
            // If the response contains an error_code, we set the status to failed - for example if code is 403 unauthorized
            if ('error_code' in res) {
              setStatus(statusResponse.FAILED)
            } else {
              setEligibility(res as EligibilityPlan[])
              setCache(key, res as EligibilityPlan[])
              setStatus(statusResponse.SUCCESS)
            }
          })
          .catch(() => {
            setStatus(statusResponse.FAILED)
          })
      }
    }
  }, [
    status,
    purchaseAmount,
    key,
    customerBillingCountry,
    customerShippingCountry,
    currentCache,
    shouldInvalidate,
    configInstallments,
    merchantId,
    domain,
    setCache,
  ])
  return [filterEligibility(eligibility, plans), status]
}
export default useFetchEligibility
