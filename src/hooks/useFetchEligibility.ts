import { useEffect, useState } from 'react'
import { ApiConfig, apiStatus, ConfigPlan, EligibilityPlan } from 'types'
import { fetchFromApi } from 'utils/fetch'
import filterEligibility from 'utils/filterEligibility'

const useFetchEligibility = (
  purchaseAmount: number,
  { domain, merchantId }: ApiConfig,
  plans?: ConfigPlan[],
  customerBillingCountry?: string,
  customerShippingCountry?: string,
): [EligibilityPlan[], apiStatus] => {
  const [eligibility, setEligibility] = useState([] as EligibilityPlan[])
  const [status, setStatus] = useState(apiStatus.PENDING)
  const configInstallments = plans?.map((plan) => ({
    installments_count: plan.installmentsCount,
    deferred_days: plan?.deferredDays,
    deferred_months: plan?.deferredMonths,
  }))
  useEffect(() => {
    if (status === apiStatus.PENDING) {
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
          setEligibility(res)
          setStatus(apiStatus.SUCCESS)
        })
        .catch(() => {
          setStatus(apiStatus.FAILED)
        })
    }
  }, [status])

  return [filterEligibility(eligibility, plans), status]
}
export default useFetchEligibility
