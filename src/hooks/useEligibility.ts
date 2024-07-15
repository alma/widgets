import { useQuery, UseQueryOptions } from 'react-query'
import { makeClient } from 'apis/client'
import { ApiConfig, EligibilityPlan } from 'types'
import { eligibilityCallGenerator, EligibilityRequest } from 'apis/eligibilityCheck'
export const useEligibilityQuery = (
  { domain, merchantId }: ApiConfig,
  eligibilityRequest: EligibilityRequest,
  options?: UseQueryOptions<EligibilityPlan[], unknown, EligibilityPlan[]>,
) => {
  const client = makeClient(`${domain}`, merchantId)
  const eligibilityCall = eligibilityCallGenerator(client)

  return useQuery<EligibilityPlan[], unknown, EligibilityPlan[]>(
    ['eligibility', merchantId, eligibilityRequest.purchaseAmount],
    async ({ signal }) => eligibilityCall(eligibilityRequest, signal),
    {
      keepPreviousData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      ...options,
    },
  )
}
