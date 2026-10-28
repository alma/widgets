import { http, HttpResponse } from 'msw'

import { ApiMode } from '@/public-api/public-api.const'
import { fetchFromApi } from '@/shared/lib/http'
import {
  ELIGIBILITY_ENDPOINT,
  eligibilityError,
  eligibilityPending,
  eligibilityPlans,
} from '@/test/eligibilityHandlers'
import { mockPlansAllEligible } from '@/test/fixtures'
import { server, unhandledRequests } from '@/test/msw-server'

const ELIGIBILITY_URL = `${ApiMode.TEST}/v2/payments/eligibility`
const requestEligibility = () =>
  fetchFromApi({
    url: ELIGIBILITY_URL,
    headers: { Authorization: 'Alma-Merchant-Auth 11gKoO' },
    body: { purchase_amount: 45000 },
  })

describe('the eligibility handlers in unit tests', () => {
  it('should answer with a copy of the plans', async () => {
    server.use(eligibilityPlans(mockPlansAllEligible))

    const plans = await requestEligibility()

    expect(plans).toEqual(JSON.parse(JSON.stringify(mockPlansAllEligible)))
    expect(plans).not.toBe(mockPlansAllEligible)
  })

  it('should let a test check the request with its own handler', async () => {
    let request: Request | undefined
    server.use(
      http.post(ELIGIBILITY_ENDPOINT, ({ request: received }) => {
        request = received.clone()
        return HttpResponse.json(mockPlansAllEligible)
      }),
    )

    await requestEligibility()

    expect(request?.url).toBe(ELIGIBILITY_URL)
    expect(request?.headers.get('Authorization')).toBe('Alma-Merchant-Auth 11gKoO')
    expect(await request?.json()).toEqual({ purchase_amount: 45000 })
  })

  it('should make the request reject on an error', async () => {
    server.use(eligibilityError())

    await expect(requestEligibility()).rejects.toThrow(TypeError)
  })

  it('should leave the request pending', async () => {
    server.use(eligibilityPending())
    let settled = false
    void requestEligibility().finally(() => {
      settled = true
    })

    await new Promise((resolve) => {
      setTimeout(resolve, 50)
    })

    expect(settled).toBe(false)
  })
})

// The tests of a describe block run in order, so the second test sees what the first one left.
describe('between two tests', () => {
  it('should let a test add a handler', async () => {
    server.use(eligibilityPlans(mockPlansAllEligible))

    await expect(requestEligibility()).resolves.toHaveLength(mockPlansAllEligible.length)
  })

  it('should drop that handler in the next test', async () => {
    await expect(requestEligibility()).rejects.toThrow(TypeError)

    // Emptied here, or setup-jsdom.ts fails the test.
    expect(unhandledRequests.splice(0)).toEqual([`POST ${ELIGIBILITY_URL}`])
  })
})

describe('a request with no handler', () => {
  it('should get a network error from the Alma API and be recorded', async () => {
    const swallowed = await requestEligibility().catch((error: unknown) => error)

    expect(swallowed).toBeInstanceOf(TypeError)
    expect(unhandledRequests.splice(0)).toEqual([`POST ${ELIGIBILITY_URL}`])
  })

  it('should not reach any other host and be recorded', async () => {
    await expect(fetch('https://example.com/widget.js')).rejects.toThrow(TypeError)

    expect(unhandledRequests.splice(0)).toEqual(['GET https://example.com/widget.js'])
  })
})
