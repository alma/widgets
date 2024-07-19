import { AxiosInstance } from 'axios'
import { ConfigPlan, EligibilityPlan } from 'types'
import filterEligibility from 'utils/filterEligibility'
import { createQueriesFromPlans } from './utils'

export type EligibilityRequest = {
  purchaseAmount: number
  plans?: ConfigPlan[]
  customerBillingCountry?: string
  customerShippingCountry?: string
}

export const eligibilityCallGenerator =
  (client: AxiosInstance) => async (eligibilityData: EligibilityRequest, signal?: AbortSignal) => {
    const { plans } = eligibilityData
    const configInstallments = plans ? createQueriesFromPlans(plans) : null

    const myObj = {
      purchase_amount: eligibilityData.purchaseAmount,
      queries: configInstallments,
      billing_address: { country: eligibilityData.customerBillingCountry },
      shipping_address: { country: eligibilityData.customerShippingCountry },
    }
    const { data } = await client.post<EligibilityPlan[]>('v2/payments/eligibility', myObj, {
      signal,
    })
    return filterEligibility(data, eligibilityData.plans)
  }
