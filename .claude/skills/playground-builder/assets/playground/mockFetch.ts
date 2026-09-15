import { EligibilityPlan, ErrorResponse } from '@/types'

export type MockResponseState = {
  plans: EligibilityPlan[]
  simulateError: boolean
  errorMessage: string
  delayMs: number
}

const state: { current: MockResponseState } = {
  current: { plans: [], simulateError: false, errorMessage: 'Simulated QA error', delayMs: 0 },
}

export const setMockResponseState = (next: MockResponseState): void => {
  state.current = next
}

let installed = false

// The widgets call the real eligibility endpoint (its host comes from the `domain` config).
// Rather than run a server, we intercept that one call at the window.fetch level and answer it
// from the playground's own state, letting every other fetch through untouched.
export const installMockFetch = (): void => {
  if (installed) return
  installed = true

  const realFetch = window.fetch.bind(window)

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = input instanceof Request ? input.url : input.toString()
    if (!url.includes('/v2/payments/eligibility')) {
      return realFetch(input, init)
    }

    // This handler only runs when a fetch actually happens, so it can't be where the cache
    // problem in gotcha 2 gets solved — a cache *hit* means useFetchEligibility never calls
    // fetch at all. That's fixed by the caller clearing sessionStorage before every remount
    // (see refreshWidgetPreview() in gotcha 2), not here.
    const { plans, simulateError, errorMessage, delayMs } = state.current
    if (delayMs > 0) {
      await new Promise((resolveDelay) => {
        setTimeout(resolveDelay, delayMs)
      })
    }

    const body: EligibilityPlan[] | ErrorResponse = simulateError
      ? { error_code: 'qa_simulated_error', message: errorMessage }
      : plans

    return new Response(JSON.stringify(body), {
      status: simulateError ? 403 : 200,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
