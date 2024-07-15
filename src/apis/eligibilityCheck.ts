import { AxiosInstance } from 'axios'
import { ConfigPlan, EligibilityPlan } from 'types'
import filterEligibility from 'utils/filterEligibility'

export type EligibilityRequest = {
  purchaseAmount: number
  plans?: ConfigPlan[]
  customerBillingCountry?: string
  customerShippingCountry?: string
}

export const eligibilityCallGenerator =
  (client: AxiosInstance) => async (eligibilityData: EligibilityRequest, signal?: AbortSignal) => {
    const { data } = await client.post<EligibilityPlan[]>(
      'v2/payments/eligibility',
      {
        purchase_amount: eligibilityData.purchaseAmount,
        queries: eligibilityData.plans,
        billing_address: { country: eligibilityData.customerBillingCountry },
        shipping_address: { country: eligibilityData.customerShippingCountry },
      },
      {
        signal,
      },
    )
    return filterEligibility(data, eligibilityData.plans)
  }
