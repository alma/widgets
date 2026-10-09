import { delay, http, HttpResponse } from 'msw'

import { EligibilityPlan } from '@/types'

/**
 * MSW handlers for the eligibility API, to use in stories:
 * `parameters: { msw: { handlers: [eligibilityPlans(plans)] } }`.
 * The widget calls `<API domain>/v2/payments/eligibility`, so they match every API domain.
 */
const ELIGIBILITY_ENDPOINT = '*/v2/payments/eligibility'

/** The eligibility API answers with these plans. */
export const eligibilityPlans = (plans: EligibilityPlan[]) =>
  http.post(ELIGIBILITY_ENDPOINT, () => HttpResponse.json(plans))

/** The eligibility request fails, as when the network is down. */
export const eligibilityError = () => http.post(ELIGIBILITY_ENDPOINT, () => HttpResponse.error())

/** The eligibility request never answers, which keeps the widget in its loading state. */
export const eligibilityPending = () =>
  http.post(ELIGIBILITY_ENDPOINT, async () => {
    await delay('infinite')
  })
