import { expect } from '@esm-bundle/chai'
import sinon from 'sinon'

import { getSharedFetch, clearSharedFetches } from './shared-fetch'

describe('getSharedFetch behavior', () => {
  beforeEach(() => {
    clearSharedFetches()
  })

  it('runs fetchFn once for concurrent callers and returns the same result', async () => {
    const fetchFn = sinon.stub().callsFake(async () => {
      await new Promise((r) => setTimeout(r, 10))
      return { ok: true }
    })

    const p1 = getSharedFetch<{ ok: boolean }>('k', fetchFn)
    const p2 = getSharedFetch<{ ok: boolean }>('k', fetchFn)

    const [r1, r2] = await Promise.all([p1, p2])

    expect(fetchFn.callCount).to.equal(1)
    expect(r1.ok).to.equal(true)
    expect(r2.ok).to.equal(true)
  })

  it('cleans up after completion so a subsequent call runs again', async () => {
    const fetchFn = sinon.stub().resolves('v')

    await getSharedFetch('k', fetchFn)
    await getSharedFetch('k', fetchFn)

    // sequential calls after completion should not be shared
    expect(fetchFn.callCount).to.equal(2)
  })
})
