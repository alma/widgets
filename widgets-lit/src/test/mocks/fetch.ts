import sinon from 'sinon'
import { ELIGIBILITY_FIXTURE } from './eligibility'

/**
 * Stub global fetch() for tests so we don't hit the real Alma API.
 */
export function stubEligibilityFetch() {
  return stubFetchJson(ELIGIBILITY_FIXTURE)
}

/**
 * Stub global fetch() with a specific JSON payload.
 */
export function stubFetchJson(payload: unknown, status = 200) {
  return sinon.stub(globalThis, 'fetch').resolves(
    new Response(JSON.stringify(payload), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }) as any,
  )
}
