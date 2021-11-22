import { useEffect, useState } from 'react'
import {
  ApiConfig,
  EligibilityPlan,
  EligibilityPlanToDisplay,
  configPlans,
  apiStatus,
  apiStatusType,
} from 'types'
import { fetchFromApi } from 'utils/fetch'
import filterELigibility from 'utils/filterEligibility'

const useFetchEligibility = (
  purchaseAmount: number,
  { domain, merchantId }: ApiConfig,
  plans?: configPlans[],
): [EligibilityPlanToDisplay[], apiStatusType] => {
  const [eligibility, setEligibility] = useState([] as EligibilityPlan[])
  const [status, setStatus] = useState(apiStatus.PENDING)
  useEffect(() => {
    if (status === apiStatus.PENDING) {
      fetchFromApi(
        domain + '/v2/payments/eligibility',
        {
          purchase_amount: purchaseAmount,
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
