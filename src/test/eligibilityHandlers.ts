import { delay, http, HttpResponse } from 'msw'

import { EligibilityPlan } from '@/types'

// MSW handlers for stories: `parameters: { msw: { handlers: [eligibilityPlans(plans)] } }`
const ELIGIBILITY_ENDPOINT = '*/v2/payments/eligibility'

export const eligibilityPlans = (plans: EligibilityPlan[]) =>
  http.post(ELIGIBILITY_ENDPOINT, () => HttpResponse.json(plans))

// Like a network failure
export const eligibilityError = () => http.post(ELIGIBILITY_ENDPOINT, () => HttpResponse.error())

// Never answers, so the widget keeps loading
export const eligibilityPending = () =>
  http.post(ELIGIBILITY_ENDPOINT, async () => {
    await delay('infinite')
  })
