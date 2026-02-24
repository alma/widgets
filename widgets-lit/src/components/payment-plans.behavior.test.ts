import { expect } from '@esm-bundle/chai'

import './payment-plans'
import type { AlmaPaymentPlans } from './payment-plans'

// Helper: wait for Lit to finish an update
async function nextFrame() {
  await new Promise((r) => requestAnimationFrame(() => r(null)))
}

describe('<alma-payment-plans> behavior parity', () => {
  beforeEach(() => {
    // Provide a valid config so connectedCallback doesn't put the component in error state.
    ;(window as any).__ALMA_WIDGET_CONFIG__ = {
      apiMode: 'https://api.sandbox.getalma.eu',
      merchantId: 'merchant_11gKoO333vEXacMNMUMUSc4c4g68g2Les4',
    }
  })

  afterEach(() => {
    delete (window as any).__ALMA_WIDGET_CONFIG__
    document.body.innerHTML = ''
  })

  it('disables auto-cycling when suggestedPaymentPlan is set and transitionDelay is not explicitly set', async () => {
    const el = document.createElement('alma-payment-plans') as AlmaPaymentPlans

    // Prevent any real API calls from running during the test.
    ;(el as any).loadEligibility = async () => {
      ;(el as any).loading = false
      ;(el as any).error = false
    }

    // Provide plans so startAnimation() can run
    ;(el as any).eligibilityPlans = [
      {
        eligible: true,
        installments_count: 3,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
      } as any,
      {
        eligible: true,
        installments_count: 4,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
      } as any,
    ]

    // Suggested plan is set, but no transition-delay attribute => should disable animation
    el.setAttribute('suggested-payment-plan', '3')

    document.body.appendChild(el)
    await nextFrame()
    ;(el as any).startAnimation()

    expect((el as any).animationTimer).to.equal(undefined)

    el.remove()
  })

  it('keeps auto-cycling when suggestedPaymentPlan is set and transitionDelay is explicitly set', async () => {
    const el = document.createElement('alma-payment-plans') as AlmaPaymentPlans

    ;(el as any).loadEligibility = async () => {
      ;(el as any).loading = false
      ;(el as any).error = false
    }
    ;(el as any).eligibilityPlans = [
      {
        eligible: true,
        installments_count: 3,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
      } as any,
      {
        eligible: true,
        installments_count: 4,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        customer_total_cost_bps: 0,
      } as any,
    ]

    el.setAttribute('suggested-payment-plan', '3')

    // Explicitly setting transition-delay should keep animation enabled
    el.setAttribute('transition-delay', '1500')
    ;(el as any).transitionDelay = 1500

    document.body.appendChild(el)
    await nextFrame()
    ;(el as any).startAnimation()

    expect((el as any).animationTimer).to.not.equal(undefined)

    // Cleanup timer
    ;(el as any).stopAnimation()
    el.remove()
  })

  it('renders nothing when hideIfNotEligible is true and there are no eligible plans', async () => {
    const el = document.createElement('alma-payment-plans') as AlmaPaymentPlans

    ;(el as any).loadEligibility = async () => {
      ;(el as any).loading = false
      ;(el as any).error = false
      ;(el as any).eligibilityPlans = []
    }

    el.hideIfNotEligible = true

    document.body.appendChild(el)
    await el.updateComplete

    // We expect a blank template: no `.container` rendered.
    expect(el.shadowRoot?.querySelector('.container')).to.equal(null)

    el.remove()
  })

  it('does not call loadEligibility when purchaseAmount is 0', async () => {
    const el = document.createElement('alma-payment-plans') as AlmaPaymentPlans

    const loadSpy = new EventTarget() as any
    ;(el as any).loadEligibility = async () => {
      loadSpy.called = true
    }

    // deliberately keep default purchaseAmount=0
    document.body.appendChild(el)
    await nextFrame()

    expect((loadSpy as any).called).to.equal(undefined)

    el.remove()
  })

  it('does not throw when global config is missing (connectedCallback)', async () => {
    delete (window as any).__ALMA_WIDGET_CONFIG__

    const el = document.createElement('alma-payment-plans') as AlmaPaymentPlans

    // Ensure it doesn't try to call the real API.
    ;(el as any).loadEligibility = async () => {
      ;(el as any).loading = false
      ;(el as any).error = true
    }

    document.body.appendChild(el)
    await nextFrame()

    expect(el).to.exist

    el.remove()
  })
})
