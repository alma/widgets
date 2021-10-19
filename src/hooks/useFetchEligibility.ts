import { useEffect, useState } from 'react'
import { ApiConfig, EligibilityPlan } from 'types'
import { fetchFromApi } from 'utils/fetch'

const useFetchEligibility = (
  purchaseAmount: number,
  { domain, merchantId }: ApiConfig,
): EligibilityPlan[] => {
  const [eligibility, setEligibility] = useState([])
  useEffect(() => {
    fetchFromApi(
      domain + '/v2/payments/eligibility',
      {
        purchase_amount: purchaseAmount,
      },
      {
        Authorization: `Alma-Merchant-Auth ${merchantId}`,
      },
    ).then((res) => {
      setEligibility(res)
    })
  }, [])
  return eligibility
}
export default useFetchEligibility
