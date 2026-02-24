import { expect } from '@esm-bundle/chai'
import sinon from 'sinon'

import { fetchEligibility } from './fetch-eligibility'
import { clearSharedFetches } from './shared-fetch'
import { WIDGET_CONFIG } from '../constants'
import { ELIGIBILITY_FIXTURE } from '../test/mocks/eligibility'

function stubOkFetch(payload: unknown) {
  return sinon.stub(globalThis, 'fetch').callsFake(async () => {
    // Return a fresh Response object every time to avoid "body stream already read".
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    }) as any
  })
}

describe('fetchEligibility - sessionStorage cache', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearSharedFetches()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('stores successful responses in sessionStorage', async () => {
    const fetchStub = stubOkFetch(ELIGIBILITY_FIXTURE)

    const result = await fetchEligibility('https://api.example.com', 'merchant_123', 45000)

    expect(result.length).to.equal(2)
    expect(fetchStub.calledOnce).to.equal(true)

    const keys = Object.keys(sessionStorage)
    const cacheKeys = keys.filter((k) => k.startsWith(WIDGET_CONFIG.SESSION_CACHE_PREFIX))
    expect(cacheKeys.length).to.equal(1)

    const cachedRaw = sessionStorage.getItem(cacheKeys[0])
    expect(cachedRaw).to.be.a('string')
    const cached = JSON.parse(cachedRaw || '{}')
    expect(cached).to.have.property('data')
    expect(cached).to.have.property('timestamp')
  })

  it('reuses cached response and does not call fetch again', async () => {
    const fetchStub = stubOkFetch(ELIGIBILITY_FIXTURE)

    await fetchEligibility('https://api.example.com', 'merchant_123', 45000)
    await fetchEligibility('https://api.example.com', 'merchant_123', 45000)

    expect(fetchStub.calledOnce).to.equal(true)
  })

  it('expires cache entries older than one hour', async () => {
    const fetchStub = stubOkFetch(ELIGIBILITY_FIXTURE)

    await fetchEligibility('https://api.example.com', 'merchant_123', 45000)

    const keys = Object.keys(sessionStorage)
    const cacheKeys = keys.filter((k) => k.startsWith(WIDGET_CONFIG.SESSION_CACHE_PREFIX))
    expect(cacheKeys.length).to.equal(1)

    const cached = JSON.parse(sessionStorage.getItem(cacheKeys[0]) || '{}')
    cached.timestamp = Date.now() - 1000 * 60 * 60 - 1
    sessionStorage.setItem(cacheKeys[0], JSON.stringify(cached))

    // Clear in-flight map and force a new response.
    clearSharedFetches()

    // The second call should hit fetch again (cache expired).
    await fetchEligibility('https://api.example.com', 'merchant_123', 45000)
    expect(fetchStub.callCount).to.equal(2)
  })

  it('uses different sessionStorage keys for different purchase amounts', async () => {
    const fetchStub = stubOkFetch(ELIGIBILITY_FIXTURE)

    await fetchEligibility('https://api.example.com', 'merchant_123', 45000)
    const keysAfterFirst = Object.keys(sessionStorage).filter((k) =>
      k.startsWith(WIDGET_CONFIG.SESSION_CACHE_PREFIX),
    )

    await fetchEligibility('https://api.example.com', 'merchant_123', 46000)
    const keysAfterSecond = Object.keys(sessionStorage).filter((k) =>
      k.startsWith(WIDGET_CONFIG.SESSION_CACHE_PREFIX),
    )

    expect(fetchStub.callCount).to.equal(2)
    expect(keysAfterFirst.length).to.equal(1)
    expect(keysAfterSecond.length).to.equal(2)

    // Ensure keys differ, meaning hashing includes the purchase amount.
    expect(keysAfterSecond[0]).to.not.equal(keysAfterSecond[1])
  })
})

describe('fetchEligibility - shared fetch de-duplication', () => {
  beforeEach(() => {
    sessionStorage.clear()
    clearSharedFetches()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('deduplicates in-flight requests with identical parameters', async () => {
    const fetchStub = stubOkFetch(ELIGIBILITY_FIXTURE)

    const p1 = fetchEligibility('https://api.example.com', 'merchant_123', 45000)
    const p2 = fetchEligibility('https://api.example.com', 'merchant_123', 45000)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(fetchStub.calledOnce).to.equal(true)
    expect(r1.length).to.equal(r2.length)
  })
})
