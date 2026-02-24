import { html, fixture, expect, waitUntil } from '@open-wc/testing'
import './modal'
import type { AlmaModal } from './modal'
import { stubFetchJson } from '../test/mocks/fetch'

/**
 * Modal parity tests around the P1X (pay now) plan.
 *
 * Preact behavior: P1X must only be displayed if explicitly requested in `plans`.
 */
describe('AlmaModal - P1X filtering', () => {
  beforeEach(() => {
    ;(window as any).__ALMA_WIDGET_CONFIG__ = {
      apiMode: 'https://api.sandbox.getalma.eu',
      merchantId: 'merchant_test',
    }

    sessionStorage.clear()
  })

  afterEach(() => {
    delete (window as any).__ALMA_WIDGET_CONFIG__
    ;(globalThis.fetch as any)?.restore?.()
  })

  it('does not include pay now (P1X) when `plans` does not explicitly include it', async () => {
    // API returns a mix including P1X. The modal should filter it out.
    const fetchStub = stubFetchJson([
      {
        eligible: true,
        installments_count: 1,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        annual_interest_rate: 0,
        payment_plan: [],
      },
      {
        eligible: true,
        installments_count: 3,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        annual_interest_rate: 0,
        payment_plan: [],
      },
    ])

    const el = await fixture<AlmaModal>(html`
      <alma-modal
        purchase-amount="45000"
        plans='[{"installmentsCount":3,"minAmount":0,"maxAmount":0}]'
      ></alma-modal>
    `)

    await waitUntil(() => fetchStub.called, 'fetch should have been called')

    // Wait for eligibility to be processed.
    await waitUntil(
      () => (el as any).eligibilityPlans && (el as any).eligibilityPlans.length > 0,
      'eligibility plans should be loaded',
      { timeout: 2000 },
    )

    // Open to render buttons.
    el.open()

    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
      'plan buttons should be rendered',
      { timeout: 2000 },
    )

    const buttons = Array.from(el.shadowRoot!.querySelectorAll('.plan-button'))
    const buttonText = buttons.map((b) => (b.textContent || '').trim()).join(' | ')

    expect(buttonText).to.contain('3')
    expect(buttonText).to.not.contain('Payer maintenant')

    fetchStub.restore()
  })

  it('includes pay now (P1X) when explicitly configured in `plans`', async () => {
    const fetchStub = stubFetchJson([
      {
        eligible: true,
        installments_count: 1,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        annual_interest_rate: 0,
        payment_plan: [],
      },
      {
        eligible: true,
        installments_count: 3,
        deferred_days: 0,
        deferred_months: 0,
        purchase_amount: 45000,
        customer_total_cost_amount: 0,
        annual_interest_rate: 0,
        payment_plan: [],
      },
    ])

    const el = await fixture<AlmaModal>(html`
      <alma-modal
        purchase-amount="45000"
        plans='[
          {"installmentsCount":1,"minAmount":0,"maxAmount":0},
          {"installmentsCount":3,"minAmount":0,"maxAmount":0}
        ]'
      ></alma-modal>
    `)

    await waitUntil(() => fetchStub.called, 'fetch should have been called')

    await waitUntil(
      () => (el as any).eligibilityPlans && (el as any).eligibilityPlans.length > 0,
      'eligibility plans should be loaded',
      { timeout: 2000 },
    )

    el.open()

    await waitUntil(
      () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
      'plan buttons should be rendered',
      { timeout: 2000 },
    )

    const buttons = Array.from(el.shadowRoot!.querySelectorAll('.plan-button'))
    const buttonText = buttons.map((b) => (b.textContent || '').trim()).join(' | ')

    expect(buttonText).to.contain('Payer maintenant')
    expect(buttonText).to.contain('3')

    fetchStub.restore()
  })
})
