import { useEffect, useState } from 'react'
import { ApiConfig, statusResponse, ConfigPlan, EligibilityPlan } from 'types'
import { fetchFromApi } from 'utils/fetch'
import filterEligibility from 'utils/filterEligibility'
import { useSessionStorage } from 'hooks/useSessionStorage'
import { isMoreThanOneHourAgo } from '../utils/utilsForStorage'

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
  const { getCache, setCache, createKey } = useSessionStorage()
  const key = createKey({
    purchaseAmount,
    plans,
    customerBillingCountry,
    customerShippingCountry,
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
      let billing_address = null
      if (customerBillingCountry) {
        billing_address = {
          country: customerBillingCountry,
        }
      }

      let shipping_address = null
      if (customerShippingCountry) {
        shipping_address = {
          country: customerShippingCountry,
        }
      }
      if (currentCache && !shouldInvalidate) {
        setEligibility(currentCache)
        setStatus(statusResponse.SUCCESS)
      }

      if (!currentCache || shouldInvalidate) {
        fetchFromApi(
          domain + '/v2/payments/eligibility',
          {
            purchase_amount: purchaseAmount,
            queries: configInstallments,
            billing_address,
            shipping_address,
          },
          {
            Authorization: `Alma-Merchant-Auth ${merchantId}`,
            'X-Alma-Agent': `Alma Widget/${process.env.VERSION}`,
          },
        )
          .then((res) => {
            setCache(key, res)
            setEligibility(res)
            setStatus(statusResponse.SUCCESS)
          })
          .catch(() => {
            setStatus(statusResponse.FAILED)
          })
      }
    }
  }, [status, purchaseAmount, key])

  return [filterEligibility(eligibility, plans), status]
}
export default useFetchEligibility
