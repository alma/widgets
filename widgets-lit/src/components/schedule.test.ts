import { html, fixture, expect, waitUntil } from '@open-wc/testing'
import '../components/schedule'
import type { AlmaSchedule } from '../components/schedule'
import { stubEligibilityFetch } from '../test/mocks/fetch'

/**
 * Unit tests for AlmaSchedule Web Component.
 *
 * These tests stub `fetch()` to avoid real network calls.
 */
describe('AlmaSchedule', () => {
  let fetchStub: ReturnType<typeof stubEligibilityFetch>

  beforeEach(() => {
    ;(window as any).__ALMA_WIDGET_CONFIG__ = {
      apiMode: 'https://api.sandbox.getalma.eu',
      merchantId: 'merchant_test',
    }

    sessionStorage.clear()
    fetchStub = stubEligibilityFetch()
  })

  afterEach(() => {
    delete (window as any).__ALMA_WIDGET_CONFIG__
    fetchStub.restore()
  })

  describe('Basic rendering', () => {
    it('renders a schedule for a configured plan', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3"></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')

      await waitUntil(
        () => (el.shadowRoot?.querySelectorAll('.installment-item').length || 0) > 0,
        'Schedule items should be visible',
        { timeout: 2000 },
      )

      const items = el.shadowRoot?.querySelectorAll('.installment-item') || []
      const total = el.shadowRoot?.querySelector('.total-block')

      expect(items.length).to.be.greaterThan(0)
      expect(total).to.exist
    })

    it('displays installment details with dates and amounts', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3"></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await waitUntil(() => el.shadowRoot?.querySelector('.installment-item'))

      const firstItem = el.shadowRoot?.querySelector('.installment-item')
      const date = firstItem?.querySelector('.installment-date')
      const amount = firstItem?.querySelector('.installment-amount')

      expect(date).to.exist
      expect(amount).to.exist
      expect(amount?.textContent?.trim()).to.not.be.empty
    })

    it('displays total block with fees information', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3"></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await waitUntil(() => el.shadowRoot?.querySelector('.total-block'))

      const totalRow = el.shadowRoot?.querySelector('.total-row.main-total')
      const feesRow = el.shadowRoot?.querySelector('.total-row.fees-row')

      expect(totalRow).to.exist
      expect(feesRow).to.exist
    })
  })

  describe('Style variants', () => {
    it('applies the small variant class', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3" small></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await el.updateComplete

      const container = el.shadowRoot?.querySelector('.schedule-widget') as HTMLElement | null
      expect(container?.classList.contains('small')).to.equal(true)
    })

    it('applies the monochrome variant class', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3" monochrome></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await el.updateComplete

      const container = el.shadowRoot?.querySelector('.schedule-widget') as HTMLElement | null
      expect(container?.classList.contains('monochrome')).to.equal(true)
    })

    it('applies the hide-border variant class', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3" hide-border></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await el.updateComplete

      const container = el.shadowRoot?.querySelector('.schedule-widget') as HTMLElement | null
      expect(container?.classList.contains('hide-border')).to.equal(true)
    })

    it('applies multiple variant classes when combined', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule
          purchase-amount="45000"
          installments-count="3"
          small
          monochrome
          hide-border
        ></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await el.updateComplete

      const container = el.shadowRoot?.querySelector('.schedule-widget') as HTMLElement | null
      expect(container?.classList.contains('small')).to.equal(true)
      expect(container?.classList.contains('monochrome')).to.equal(true)
      expect(container?.classList.contains('hide-border')).to.equal(true)
    })
  })

  describe('Different plan types', () => {
    it('handles pay-now (P1X) configuration', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="1"></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await el.updateComplete

      // Should render without errors (may show no-plans if mock doesn't include P1X)
      const widget = el.shadowRoot?.querySelector('.schedule-widget')
      expect(widget).to.exist
    })

    it('handles deferred schedule (J+15) configuration', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule
          purchase-amount="45000"
          installments-count="1"
          deferred-days="15"
        ></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await el.updateComplete

      // Should render without errors (may show no-plans if mock doesn't include deferred)
      const widget = el.shadowRoot?.querySelector('.schedule-widget')
      expect(widget).to.exist
    })
  })

  describe('Error handling', () => {
    it('displays loading state initially', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule purchase-amount="45000" installments-count="3"></alma-schedule>
      `)

      const loading = el.shadowRoot?.querySelector('.loading')
      expect(loading).to.exist
    })

    it('handles missing purchase amount gracefully', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule installments-count="3"></alma-schedule>
      `)

      await el.updateComplete
      const noPlans = el.shadowRoot?.querySelector('.no-plans')
      expect(noPlans).to.exist
    })
  })

  describe('Plan selector variant', () => {
    it('renders plan buttons when installmentsCount is 0 and plans are provided', async () => {
      const el = await fixture<AlmaSchedule>(html`
        <alma-schedule
          purchase-amount="45000"
          installments-count="0"
          plans='[{"installmentsCount":3,"minAmount":0,"maxAmount":0},{"installmentsCount":4,"minAmount":0,"maxAmount":0}]'
        ></alma-schedule>
      `)

      await waitUntil(() => fetchStub.called)
      await waitUntil(() => (el.shadowRoot?.querySelectorAll('.plan-button').length || 0) > 0)

      const buttons = el.shadowRoot?.querySelectorAll('.plan-button') || []
      expect(buttons.length).to.be.greaterThan(0)
    })
  })
})
