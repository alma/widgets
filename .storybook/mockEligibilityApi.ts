import { EligibilityPlan } from '@/types'

/**
 * What the mocked eligibility endpoint answers for a story, set with the `eligibility` parameter:
 * the plans to return, `'error'` for a failed request, or `'pending'` for a request that never
 * answers, which keeps the widget in its loading state.
 */
export type EligibilityResponse = EligibilityPlan[] | 'error' | 'pending'

const ELIGIBILITY_ENDPOINT = '/v2/payments/eligibility'

/**
 * Replaces `window.fetch` so that the eligibility request never reaches the Alma API. Other
 * requests go through untouched. Returns a function that restores the real `fetch`.
 */
export const mockEligibilityApi = (response: EligibilityResponse): (() => void) => {
  const realFetch = window.fetch

  window.fetch = (input, init) => {
    const url = input instanceof Request ? input.url : String(input)
    if (!url.endsWith(ELIGIBILITY_ENDPOINT)) return realFetch(input, init)

    if (response === 'pending') return new Promise(() => {})
    if (response === 'error') return Promise.reject(new TypeError('Failed to fetch'))
    return Promise.resolve(new Response(JSON.stringify(response)))
  }

  return () => {
    window.fetch = realFetch
  }
}
