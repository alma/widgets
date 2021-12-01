import { useEffect, useState } from 'react'
import { ApiConfig, apiStatus, apiStatusType, ConfigPlan, EligibilityPlan } from 'types'
import { fetchFromApi } from 'utils/fetch'
import filterELigibility from 'utils/filterEligibility'

const useFetchEligibility = (
  purchaseAmount: number,
  { domain, merchantId }: ApiConfig,
  plans?: ConfigPlan[],
): [EligibilityPlan[], apiStatusType] => {
  const [eligibility, setEligibility] = useState([] as EligibilityPlan[])
  const [status, setStatus] = useState(apiStatus.PENDING)
  const configInstallments = plans?.map((plan) => ({ installments_count: plan.installmentsCount }))
  useEffect(() => {
    if (status === apiStatus.PENDING) {
      fetchFromApi(
        domain + '/v2/payments/eligibility',
        {
          purchase_amount: purchaseAmount,
          queries: configInstallments,
        },
        {
          Authorization: `Alma-Merchant-Auth ${merchantId}`,
        },
      )
        .then((res) => {
          setStatus(apiStatus.SUCCESS)
          setEligibility(res)
        })
        .catch(() => {
          setStatus(apiStatus.FAILED)
        })
    }
  }, [status])

  return [filterELigibility(eligibility, plans), status]
}
export default useFetchEligibility
