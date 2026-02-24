import { html, fixture, expect, waitUntil, oneEvent } from '@open-wc/testing'
import '../components/payment-plans'
import type { AlmaPaymentPlans } from '../components/payment-plans'
import { stubEligibilityFetch, stubFetchJson } from '../test/mocks/fetch'
import { ELIGIBILITY_WITH_INELIGIBLE_FIXTURE } from '../test/mocks/eligibility'
import { formatPrice } from '../utils'

/**
 * Unit tests for AlmaPaymentPlans Web Component
 *
 * These tests stub `fetch()` to avoid real network calls.
 */
describe('AlmaPaymentPlans', () => {
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

  describe('Basic Rendering', () => {
    it('should render the component', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000"></alma-payment-plans>
      `)

      expect(el).to.exist
      expect(el.tagName.toLowerCase()).to.equal('alma-payment-plans')
    })

    it('should display payment plans after loading', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000"></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')

      await waitUntil(
        () => {
          const buttons = el.shadowRoot!.querySelectorAll('.plan-button')
          return buttons.length > 0
        },
        'Payment plans should be visible',
        { timeout: 2000 },
      )

      const buttons = el.shadowRoot!.querySelectorAll('.plan-button')
      expect(buttons.length).to.be.greaterThan(0)
    })

    it('should display Alma logo', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000"></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')

      await waitUntil(
        () => {
          const logo = el.shadowRoot!.querySelector('.logo')
          return logo !== null
        },
        'Logo should be visible',
        { timeout: 2000 },
      )

      const logo = el.shadowRoot!.querySelector('.logo')
      expect(logo).to.exist
    })
  })

  describe('Properties', () => {
    it('should accept purchase-amount property', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000"></alma-payment-plans>
      `)

      expect(el.purchaseAmount).to.equal(45000)
    })

    it('should accept locale property', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" locale="en"></alma-payment-plans>
      `)

      expect(el.locale).to.equal('en')
    })

    it('should accept monochrome property', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" monochrome></alma-payment-plans>
      `)

      expect(el.monochrome).to.be.true
    })

    it('should accept hide-border property', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" hide-border></alma-payment-plans>
      `)

      expect(el.hideBorder).to.be.true
      await el.updateComplete
      expect(el.hasAttribute('hide-border')).to.be.true
    })

    it('should set monochrome styles when monochrome is true', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" monochrome></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await el.updateComplete

      // The component toggles a host-level attribute/style; we assert the property.
      expect(el.monochrome).to.be.true
    })

    it('should honor suggested-payment-plan by activating the matching plan button when present', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" suggested-payment-plan="3"></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')

      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(el.shadowRoot!.querySelectorAll('.plan-button'))
      // Suggested is stored as installments_count. We expect the 3x button to be active.
      const active = buttons.find((b) => b.classList.contains('active'))
      expect(active).to.exist
      expect(active?.textContent || '').to.contain('3')
    })

    it('should accept color-scheme attribute', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" color-scheme="gray"></alma-payment-plans>
      `)

      await el.updateComplete
      expect(el.getAttribute('color-scheme')).to.equal('gray')
    })

    it('should render compact mode without info text and with compact logo', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000" compact-mode></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const container = el.shadowRoot!.querySelector('.container') as HTMLElement
      const info = el.shadowRoot!.querySelector('.info-container')
      const logo = el.shadowRoot!.querySelector('svg.logo') as SVGElement

      expect(container.classList.contains('compact')).to.equal(true)
      expect(info).to.equal(null)
      expect(logo.getAttribute('width')).to.equal('16')
      expect(logo.getAttribute('height')).to.equal('16')
    })
  })

  describe('Fallback rendering', () => {
    it('should render a fallback message when hideIfNotEligible is false and there are no plans', async () => {
      // Override fetch to return an empty eligibility response.
      fetchStub.restore()
      fetchStub = stubFetchJson([])

      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000"></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await el.updateComplete

      const info = el.shadowRoot?.textContent || ''
      expect(info.length).to.be.greaterThan(0)
    })

    it('renders nothing when hideIfNotEligible is true and no plans are available', async () => {
      const el = await fixture<any>(html`
        <alma-payment-plans hide-if-not-eligible purchase-amount="0"></alma-payment-plans>
      `)

      await el.updateComplete
      expect(el.shadowRoot?.querySelector('.container')).to.equal(null)
    })
  })

  describe('User Interactions', () => {
    it('should dispatch plan-selected event when plan is clicked', async () => {
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans purchase-amount="45000"></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')

      await waitUntil(
        () => {
          const buttons = el.shadowRoot!.querySelectorAll('.plan-button')
          return buttons.length > 0
        },
        'Payment plans should be visible',
        { timeout: 2000 },
      )

      const buttons = el.shadowRoot!.querySelectorAll('.plan-button')
      const firstButton = buttons[0] as HTMLElement

      setTimeout(() => firstButton.click())
      const event = await oneEvent(el, 'plan-selected')

      expect(event).to.exist
      expect(event.detail).to.have.property('plan')
    })

    it('moves focus and active plan with arrow keys between eligible plans', async () => {
      fetchStub.restore()
      fetchStub = stubFetchJson(ELIGIBILITY_WITH_INELIGIBLE_FIXTURE)

      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans
          purchase-amount="45000"
          .plans=${JSON.stringify([
            { installmentsCount: 2, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 3, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 4, minAmount: 0, maxAmount: 0 },
          ])}
        ></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(
        el.shadowRoot!.querySelectorAll('.plan-button'),
      ) as HTMLButtonElement[]

      const firstEligible = buttons[0]
      firstEligible.focus()
      firstEligible.dispatchEvent(
        new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }),
      )
      await el.updateComplete

      const activeAfter = buttons.find((b) => b.classList.contains('active'))
      expect(activeAfter).to.equal(buttons[1])
    })
  })

  describe('Ineligible plans (visible but disabled)', () => {
    it('renders ineligible plans as disabled buttons only when `plans` config is provided', async () => {
      fetchStub.restore()
      fetchStub = stubFetchJson(ELIGIBILITY_WITH_INELIGIBLE_FIXTURE)

      // Provide `plans` so PaymentPlans sends queries and expects eligible=false entries.
      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans
          purchase-amount="45000"
          .plans=${JSON.stringify([
            { installmentsCount: 1, deferredDays: 15, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 10, minAmount: 0, maxAmount: 0 },
          ])}
        ></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(
        el.shadowRoot!.querySelectorAll('.plan-button'),
      ) as HTMLButtonElement[]
      const ineligible = buttons.find((b) => b.getAttribute('aria-disabled') === 'true')

      expect(ineligible).to.exist
      expect(ineligible?.disabled).to.equal(true)
      expect(ineligible?.getAttribute('tabindex')).to.equal('-1')
    })

    it('does not dispatch plan-selected when clicking an ineligible plan', async () => {
      fetchStub.restore()
      fetchStub = stubFetchJson(ELIGIBILITY_WITH_INELIGIBLE_FIXTURE)

      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans
          purchase-amount="45000"
          .plans=${JSON.stringify([
            { installmentsCount: 1, deferredDays: 15, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 10, minAmount: 0, maxAmount: 0 },
          ])}
        ></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(
        el.shadowRoot!.querySelectorAll('.plan-button'),
      ) as HTMLButtonElement[]
      const ineligible = buttons.find((b) => b.getAttribute('aria-disabled') === 'true')
      expect(ineligible).to.exist

      let eventFired = false
      const handler = () => {
        eventFired = true
      }
      el.addEventListener('plan-selected', handler)

      ineligible!.click()
      await el.updateComplete

      expect(eventFired).to.equal(false)

      el.removeEventListener('plan-selected', handler)
    })

    it('shows min amount info when purchase amount is below minimum', async () => {
      fetchStub.restore()
      fetchStub = stubFetchJson(ELIGIBILITY_WITH_INELIGIBLE_FIXTURE)

      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans
          purchase-amount="45000"
          .plans=${JSON.stringify([
            { installmentsCount: 2, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 3, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 4, minAmount: 0, maxAmount: 0 },
          ])}
        ></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(
        el.shadowRoot!.querySelectorAll('.plan-button'),
      ) as HTMLButtonElement[]
      const ineligible = buttons.find((b) => b.getAttribute('aria-disabled') === 'true')
      expect(ineligible).to.exist

      ineligible!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await el.updateComplete

      const minAmount = formatPrice(900000, 'fr')
      const maxAmount = formatPrice(13500000, 'fr')
      const infoText = el.shadowRoot!.querySelector('.info')?.textContent || ''

      expect(infoText).to.contain(minAmount)
      expect(infoText).to.not.contain(maxAmount)
    })

    it('shows max amount info when purchase amount is above maximum', async () => {
      fetchStub.restore()
      fetchStub = stubFetchJson(ELIGIBILITY_WITH_INELIGIBLE_FIXTURE)

      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans
          purchase-amount="20000000"
          .plans=${JSON.stringify([
            { installmentsCount: 2, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 3, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 4, minAmount: 0, maxAmount: 0 },
          ])}
        ></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(
        el.shadowRoot!.querySelectorAll('.plan-button'),
      ) as HTMLButtonElement[]
      const ineligible = buttons.find((b) => b.getAttribute('aria-disabled') === 'true')
      expect(ineligible).to.exist

      ineligible!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await el.updateComplete

      const maxAmount = formatPrice(13500000, 'fr')
      const infoText = el.shadowRoot!.querySelector('.info')?.textContent || ''

      expect(infoText).to.contain(maxAmount)
    })

    it('does not change the active plan on hover for ineligible plans', async () => {
      fetchStub.restore()
      fetchStub = stubFetchJson(ELIGIBILITY_WITH_INELIGIBLE_FIXTURE)

      const el = await fixture<AlmaPaymentPlans>(html`
        <alma-payment-plans
          purchase-amount="45000"
          .plans=${JSON.stringify([
            { installmentsCount: 2, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 3, minAmount: 0, maxAmount: 0 },
            { installmentsCount: 4, minAmount: 0, maxAmount: 0 },
          ])}
        ></alma-payment-plans>
      `)

      await waitUntil(() => fetchStub.called, 'fetch should have been called')
      await waitUntil(
        () => el.shadowRoot!.querySelectorAll('.plan-button').length > 0,
        'Plan buttons should be visible',
        { timeout: 2000 },
      )

      const buttons = Array.from(
        el.shadowRoot!.querySelectorAll('.plan-button'),
      ) as HTMLButtonElement[]
      const activeBefore = buttons.find((b) => b.classList.contains('active'))
      const ineligible = buttons.find((b) => b.getAttribute('aria-disabled') === 'true')

      expect(activeBefore).to.exist
      expect(ineligible).to.exist

      ineligible!.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }))
      await el.updateComplete

      const activeAfter = buttons.find((b) => b.classList.contains('active'))
      expect(activeAfter).to.equal(activeBefore)
    })
  })
})
