import { useEffect, useState } from 'react'
import { ApiConfig, EligibilityPlan, EligibilityPlanToDisplay, configPlans } from 'types'
import { fetchFromApi } from 'utils/fetch'
import filterELigibility from 'utils/filterEligibility'

const useFetchEligibility = (
  purchaseAmount: number,
  { domain, merchantId }: ApiConfig,
  plans?: configPlans[],
): EligibilityPlanToDisplay[] => {
  const [eligibility, setEligibility] = useState([] as EligibilityPlan[])
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

  return filterELigibility(eligibility, plans)
}
export default useFetchEligibility
