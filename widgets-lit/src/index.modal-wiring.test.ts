import { expect } from '@esm-bundle/chai'
import sinon from 'sinon'

import { Alma as AlmaNamed } from './index'
import { stubEligibilityFetch } from './test/mocks/fetch'

/**
 * Tests around the public JS API wiring between PaymentPlans and Modal.
 */
describe('Alma Widgets - modal wiring', () => {
  let fetchStub: ReturnType<typeof stubEligibilityFetch>

  beforeEach(() => {
    document.body.innerHTML = ''
    sessionStorage.clear()
    fetchStub = stubEligibilityFetch()
  })

  afterEach(() => {
    fetchStub.restore()
  })

  it('auto-creates a modal when modalSelector is not provided', async () => {
    document.body.innerHTML = '<div id="pp"></div>'

    const widgets = AlmaNamed.Widgets.initialize('merchant_test', AlmaNamed.ApiMode.TEST)
    widgets.add(AlmaNamed.Widgets.PaymentPlans, {
      container: '#pp',
      purchaseAmount: 45000,
      locale: 'fr',
    })

    const paymentPlans = document.querySelector('#pp alma-payment-plans') as any
    expect(paymentPlans).to.exist

    // The auto-modal container is created next to the payment plans container.
    const modal = document.querySelector('alma-modal') as any
    expect(modal).to.exist
  })

  it('uses a provided modalSelector in manual integration', async () => {
    document.body.innerHTML = '<div id="pp"></div><div id="modal"><alma-modal></alma-modal></div>'

    const widgets = AlmaNamed.Widgets.initialize('merchant_test', AlmaNamed.ApiMode.TEST)

    widgets.add(AlmaNamed.Widgets.PaymentPlans, {
      container: '#pp',
      purchaseAmount: 45000,
      locale: 'fr',
      modalSelector: '#modal alma-modal',
    })

    const modal = document.querySelector('#modal alma-modal') as any
    const openSpy = sinon.spy(modal, 'open')

    const paymentPlans = document.querySelector('#pp alma-payment-plans') as any

    // Simulate click by emitting the event PaymentPlans emits.
    paymentPlans.dispatchEvent(
      new CustomEvent('plan-selected', {
        detail: {
          plan: { installments_count: 3, deferred_days: 0, deferred_months: 0 },
          purchaseAmount: 45000,
        },
        bubbles: true,
        composed: true,
      }),
    )

    expect(openSpy.called).to.equal(true)
  })
})
