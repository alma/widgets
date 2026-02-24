import { expect } from '@esm-bundle/chai'
import sinon from 'sinon'

import { fetchEligibility } from './fetch-eligibility'
import { ELIGIBILITY_FIXTURE } from '../test/mocks/eligibility'

/**
 * Integration-ish test to ensure shared-fetch deduplicates in-flight eligibility requests.
 *
 * This simulates two widgets calling fetchEligibility with the same parameters
 * at the same time (PaymentPlans + Modal).
 */
describe('fetchEligibility + shared-fetch (in-flight dedup)', () => {
  let fetchStub: sinon.SinonStub

  beforeEach(() => {
    sessionStorage.clear()
    fetchStub = sinon.stub(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchStub.restore()
  })

  it('makes only one network call for two concurrent identical requests', async () => {
    // Create a fetch that resolves after a tiny delay so both callers overlap.
    // fetchEligibility expects the response body to be the plan array directly.
    fetchStub.callsFake(async () => {
      await new Promise((r) => setTimeout(r, 10))
      return new Response(JSON.stringify(ELIGIBILITY_FIXTURE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    })

    const p1 = fetchEligibility('TEST', 'merchant', 45000)
    const p2 = fetchEligibility('TEST', 'merchant', 45000)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(fetchStub.callCount).to.equal(1)
    expect(Array.isArray(r1)).to.equal(true)
    expect(Array.isArray(r2)).to.equal(true)
    expect(r1.length).to.be.greaterThan(0)
    expect(r2.length).to.equal(r1.length)
  })
})
