import { expect } from '@esm-bundle/chai'
import sinon from 'sinon'

import { fetchEligibility } from './fetch-eligibility'
import { ELIGIBILITY_FIXTURE } from '../test/mocks/eligibility'

/**
 * Behavior tests for fetchEligibility.
 *
 * These tests complement the existing unit tests by validating edge-case behavior
 * around cache keys and cache bypass.
 */
describe('fetchEligibility (behavior)', () => {
  let fetchStub: sinon.SinonStub

  beforeEach(() => {
    sessionStorage.clear()
    fetchStub = sinon.stub(globalThis, 'fetch')
  })

  afterEach(() => {
    fetchStub.restore()
  })

  it('uses different cache keys for different purchase amounts', async () => {
    fetchStub.resolves(
      new Response(JSON.stringify(ELIGIBILITY_FIXTURE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await fetchEligibility('TEST', 'merchant', 1000)
    await fetchEligibility('TEST', 'merchant', 2000)

    // Two distinct requests => two network calls.
    expect(fetchStub.callCount).to.equal(2)
  })

  it('hits sessionStorage cache on the same key', async () => {
    fetchStub.resolves(
      new Response(JSON.stringify(ELIGIBILITY_FIXTURE), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    )

    await fetchEligibility('TEST', 'merchant', 1000)
    await fetchEligibility('TEST', 'merchant', 1000)

    // Second call should be served from cache.
    expect(fetchStub.callCount).to.equal(1)
  })
})
