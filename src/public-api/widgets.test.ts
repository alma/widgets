import { html } from 'lit'

import { ApiMode, Widgets } from '@/index'
import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { TEST_MERCHANT_ID } from '@/test/mount-widget'

// Stands in for the real elements, which don't exist yet.
class PlaceholderHost extends LightDomElement {
  firstRender?: Record<string, unknown>

  disconnections = 0

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.disconnections += 1
  }

  protected override render() {
    this.firstRender ??= { ...(this as object) }
    return html`<div data-testid="placeholder"></div>`
  }
}
customElements.define('alma-payment-plans', class extends PlaceholderHost {})

const CONTAINER = '#alma-widget'

const apiData = { domain: ApiMode.TEST, merchantId: TEST_MERCHANT_ID }

const widgets = () => Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST)

const addPaymentPlans = (options: Partial<PaymentPlanWidgetOptions> = {}) =>
  widgets().add(Widgets.PaymentPlans, { container: CONTAINER, purchaseAmount: 45000, ...options })

const createContainer = (): HTMLElement => {
  const container = document.createElement('div')
  container.id = CONTAINER.slice(1)
  document.body.append(container)
  return container
}

const hostsIn = (container: Element) =>
  Array.from(container.querySelectorAll<PlaceholderHost>('alma-payment-plans'))

describe('WidgetsController', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createContainer()
  })

  describe('add(PaymentPlans)', () => {
    it("should empty the container, append one host with master's defaults and return undefined", () => {
      container.append(document.createElement('p'))

      const result = addPaymentPlans()

      expect(result).toBeUndefined()
      expect(container.children).toHaveLength(1)
      const [host] = hostsIn(container)
      expect(host.firstRender).toMatchObject({
        apiData,
        purchaseAmount: 45000,
        configPlans: undefined,
        hideBorder: false,
        monochrome: true,
        locale: Locale.en,
      })
      // Rendered before add() returned.
      expect(host.querySelector('[data-testid="placeholder"]')).not.toBeNull()
    })

    it('should give the host every option that master passes, from its first render', () => {
      const plans = [{ installmentsCount: 3, minAmount: 5000, maxAmount: 200000 }]
      const cards: Card[] = ['visa']
      const onModalClose = vi.fn()

      addPaymentPlans({
        plans,
        transitionDelay: 2000,
        hideIfNotEligible: true,
        hideBorder: true,
        monochrome: false,
        suggestedPaymentPlan: [3, 4],
        customerBillingCountry: 'FR',
        customerShippingCountry: 'DE',
        merchantCoversAllFees: true,
        locale: Locale['fr-FR'],
        cards,
        onModalClose,
      })

      const [host] = hostsIn(container)
      expect(host.firstRender).toMatchObject({
        apiData,
        purchaseAmount: 45000,
        configPlans: plans,
        transitionDelay: 2000,
        hideIfNotEligible: true,
        hideBorder: true,
        monochrome: false,
        suggestedPaymentPlan: [3, 4],
        customerBillingCountry: 'FR',
        customerShippingCountry: 'DE',
        merchantCoversAllFees: true,
        locale: Locale['fr-FR'],
        cards,
        onModalClose,
      })
      expect(host.firstRender).not.toHaveProperty('plans')
    })

    it('should keep null, which master defaults only when an option is missing', () => {
      addPaymentPlans({ hideBorder: null, monochrome: null } as unknown as PaymentPlanWidgetOptions)

      const [host] = hostsIn(container)
      expect(host.firstRender).toMatchObject({ hideBorder: null, monochrome: null })
    })
  })

  describe('a second add() on the same container', () => {
    it('should remove the first host, which disconnects, and append a new one', () => {
      addPaymentPlans({ purchaseAmount: 45000 })
      const [first] = hostsIn(container)

      addPaymentPlans({ purchaseAmount: 90000 })

      expect(first.isConnected).toBe(false)
      expect(first.disconnections).toBe(1)
      const [second] = hostsIn(container)
      expect(second).not.toBe(first)
      expect(second.firstRender).toMatchObject({ purchaseAmount: 90000 })
    })

    it('should keep a node that the merchant added after the first mount', () => {
      addPaymentPlans()
      const merchantNode = document.createElement('p')
      container.append(merchantNode)

      addPaymentPlans()

      const [host] = hostsIn(container)
      expect(Array.from(container.children)).toEqual([merchantNode, host])
    })

    it('should mount a host after the merchant empties the container', () => {
      addPaymentPlans()
      // eslint-disable-next-line no-restricted-syntax -- what a merchant page does
      container.innerHTML = ''

      expect(() => addPaymentPlans()).not.toThrow()

      expect(hostsIn(container)).toHaveLength(1)
    })

    it('should look the container up again', () => {
      addPaymentPlans()
      const newContainer = document.createElement('div')
      container.replaceWith(newContainer)
      newContainer.id = CONTAINER.slice(1)

      addPaymentPlans()

      expect(hostsIn(newContainer)).toHaveLength(1)
    })

    it('should remove the host for an unknown name, and return undefined', () => {
      addPaymentPlans()
      const [host] = hostsIn(container)

      const unknownName = 'Unknown' as typeof Widgets.PaymentPlans
      const options = { container: CONTAINER } as PaymentPlanWidgetOptions
      const result = widgets().add(unknownName, options)

      expect(result).toBeUndefined()
      expect(host.disconnections).toBe(1)
      expect(container.children).toHaveLength(0)
    })
  })
})
