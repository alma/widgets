import { expect } from '@esm-bundle/chai'

import { Alma as NamedAlma } from './index'
import { stubFetchJson } from './test/mocks/fetch'
import { ELIGIBILITY_FIXTURE } from './test/mocks/eligibility'

function nextFrame() {
  return new Promise((r) => requestAnimationFrame(() => r(null)))
}

describe('Index integration (PaymentPlans + Modal wiring)', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
  })

  afterEach(() => {
    ;(globalThis.fetch as any)?.restore?.()
  })

  it('auto mode: PaymentPlans creates a modal and opens it on plan-selected', async () => {
    const fetchStub = stubFetchJson(ELIGIBILITY_FIXTURE)

    document.body.innerHTML = `<div id="pp"></div>`

    const widgets = NamedAlma.Widgets.initialize('merchant_test', NamedAlma.ApiMode.TEST)
    widgets.add(NamedAlma.Widgets.PaymentPlans, {
      container: '#pp',
      purchaseAmount: 45000,
      locale: 'fr',
    })

    await nextFrame()

    const pp = document.querySelector('alma-payment-plans') as any
    expect(pp).to.exist

    // External test dispatch (we don't want to rely on internal fetch/render in a wiring test)
    const plan = { installments_count: 3, deferred_days: 0, deferred_months: 0 }
    pp.dispatchEvent(new CustomEvent('plan-selected', { detail: { plan, purchaseAmount: 45000 } }))

    await nextFrame()

    const modal = document.querySelector('alma-modal') as any
    expect(modal).to.exist
    expect(modal.isOpen).to.equal(true)

    fetchStub.restore()
  })

  it('manual mode: PaymentPlans opens a provided modal via modalSelector', async () => {
    const fetchStub = stubFetchJson(ELIGIBILITY_FIXTURE)

    document.body.innerHTML = `<div id="pp"></div><div id="modal-container"></div>`

    const widgets = NamedAlma.Widgets.initialize('merchant_test', NamedAlma.ApiMode.TEST)

    // Create the manual modal
    widgets.add(NamedAlma.Widgets.Modal, {
      container: '#modal-container',
      purchaseAmount: 45000,
      locale: 'fr',
    })

    // Add PaymentPlans wired to that modal
    widgets.add(NamedAlma.Widgets.PaymentPlans, {
      container: '#pp',
      purchaseAmount: 45000,
      locale: 'fr',
      modalSelector: '#modal-container alma-modal',
    })

    await nextFrame()

    const pp = document.querySelector('alma-payment-plans') as any
    const modal = document.querySelector('#modal-container alma-modal') as any

    expect(pp).to.exist
    expect(modal).to.exist

    pp.dispatchEvent(
      new CustomEvent('plan-selected', {
        detail: { plan: { installments_count: 1, deferred_days: 15, deferred_months: 0 } },
      }),
    )

    await nextFrame()

    expect(modal.isOpen).to.equal(true)

    fetchStub.restore()
  })
})
