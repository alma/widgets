import { html } from 'lit'
import type { MockInstance } from 'vitest'

import { ApiMode, Widgets } from '@/index'
import type { ModalHandle } from '@/public-api/modal-handle'
import type {
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetOptions,
} from '@/public-api/public-api.types'
import { LightDomElement } from '@/shared/custom-elements/light-dom-element'
import { Locale } from '@/shared/i18n/i18n.const'
import { TEST_CONTAINER, TEST_MERCHANT_ID } from '@/test/utils/mount-widget'
import { closeModalOf } from '@/widgets/eligibility-modal/controllers/modal-portal.controller'
import { ELIGIBILITY_MODAL_TAG } from '@/widgets/eligibility-modal/eligibility-modal.const'
import type { Card } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.types'
import { PAYMENT_PLANS_TAG } from '@/widgets/payment-plans/payment-plans.const'

// The real elements would take their tags before the placeholders below.
vi.mock('@/widgets/eligibility-modal/eligibility-modal.element', () => ({}))
vi.mock('@/widgets/payment-plans/payment-plans.element', () => ({}))
vi.mock('@/widgets/eligibility-modal/controllers/modal-portal.controller', () => ({
  closeModalOf: vi.fn(),
}))

// Stands in for the real elements, which the facade tests leave out.
class PlaceholderHost extends LightDomElement {
  firstRender?: Record<string, unknown>

  disconnections = 0

  onDisconnect?: () => void

  override disconnectedCallback(): void {
    super.disconnectedCallback()
    this.disconnections += 1
    this.onDisconnect?.()
  }

  protected override render() {
    this.firstRender ??= { ...(this as object) }
    return html`<div data-testid="placeholder"></div>`
  }
}
customElements.define(PAYMENT_PLANS_TAG, class extends PlaceholderHost {})
customElements.define(ELIGIBILITY_MODAL_TAG, class extends PlaceholderHost {})

const apiData = { domain: ApiMode.TEST, merchantId: TEST_MERCHANT_ID }

const widgets = () => Widgets.initialize(TEST_MERCHANT_ID, ApiMode.TEST)

const addPaymentPlans = (options: Partial<PaymentPlanWidgetOptions> = {}) =>
  widgets().add(Widgets.PaymentPlans, {
    container: TEST_CONTAINER,
    purchaseAmount: 45000,
    ...options,
  })

const addModal = (options: Partial<ModalOptions> = {}) =>
  widgets().add(Widgets.Modal, {
    container: TEST_CONTAINER,
    clickableSelector: '#open-modal',
    purchaseAmount: 45000,
    ...options,
  }) as ModalHandle

const createContainer = (): HTMLElement => {
  const container = document.createElement('div')
  container.id = TEST_CONTAINER.slice(1)
  document.body.append(container)
  return container
}

const hostsIn = (container: Element, tagName = PAYMENT_PLANS_TAG) =>
  Array.from(container.querySelectorAll<PlaceholderHost>(tagName))

const modalHostsIn = (container: Element) => hostsIn(container, ELIGIBILITY_MODAL_TAG)

const openModal = (options: Partial<ModalOptions> = {}) => {
  const handle = addModal(options)
  handle.open()
  const [host] = modalHostsIn(document.body)
  return { handle, host }
}

describe('WidgetsController', () => {
  let container: HTMLElement

  beforeEach(() => {
    container = createContainer()
  })

  describe('add(PaymentPlans)', () => {
    it('should empty the container, append one host with the default options and return undefined', () => {
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

    it('should empty the container in a browser without replaceChildren', () => {
      container.append(document.createElement('p'), 'text')
      const { replaceChildren } = Element.prototype
      Reflect.deleteProperty(Element.prototype, 'replaceChildren')

      try {
        addPaymentPlans()
      } finally {
        Element.prototype.replaceChildren = replaceChildren
      }

      expect(container.childNodes).toHaveLength(1)
      expect(hostsIn(container)).toHaveLength(1)
    })

    it('should give the host every option from its first render', () => {
      const cards: Card[] = ['visa']
      const options = {
        plans: [{ installmentsCount: 3, minAmount: 5000, maxAmount: 200000 }],
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
        onModalClose: vi.fn(),
      }

      addPaymentPlans(options)

      const [host] = hostsIn(container)
      const { plans: configPlans, ...sameNames } = options
      expect(host.firstRender).toMatchObject({
        apiData,
        purchaseAmount: 45000,
        configPlans,
        ...sameNames,
      })
      expect(host.firstRender).not.toHaveProperty('plans')
    })

    it('should keep null, since only a missing option gets its default', () => {
      addPaymentPlans({ hideBorder: null, monochrome: null } as unknown as PaymentPlanWidgetOptions)

      const [host] = hostsIn(container)
      expect(host.firstRender).toMatchObject({ hideBorder: null, monochrome: null })
    })

    it('should give each host the locale of its own add()', () => {
      const other = document.createElement('div')
      other.id = 'alma-widget-other'
      document.body.append(other)

      addPaymentPlans({ locale: Locale.fr })
      addPaymentPlans({ container: '#alma-widget-other', locale: Locale.en })

      expect([container, other].map((element) => hostsIn(element)[0].firstRender?.locale)).toEqual([
        Locale.fr,
        Locale.en,
      ])
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
      // What a merchant page does.
      container.innerHTML = ''

      expect(() => addPaymentPlans()).not.toThrow()

      expect(hostsIn(container)).toHaveLength(1)
    })

    it('should look the container up again', () => {
      addPaymentPlans()
      const newContainer = document.createElement('div')
      container.replaceWith(newContainer)
      newContainer.id = TEST_CONTAINER.slice(1)

      addPaymentPlans()

      expect(hostsIn(newContainer)).toHaveLength(1)
    })

    it('should remove the host for an unknown name, and return undefined', () => {
      addPaymentPlans()
      const [host] = hostsIn(container)

      const unknownName = 'Unknown' as typeof Widgets.PaymentPlans
      const options = { container: TEST_CONTAINER } as PaymentPlanWidgetOptions
      const result = widgets().add(unknownName, options)

      expect(result).toBeUndefined()
      expect(host.disconnections).toBe(1)
      expect(container.children).toHaveLength(0)
    })
  })

  describe('add(Modal)', () => {
    it('should remove a PaymentPlans host at once, mount nothing and return { open, close }', () => {
      addPaymentPlans()
      const [plansHost] = hostsIn(container)

      const handle = addModal()

      expect(handle).toEqual({ open: expect.any(Function), close: expect.any(Function) })
      expect(plansHost.disconnections).toBe(1)
      expect(container.children).toHaveLength(0)
    })

    it("should leave the merchant's content alone until open()", () => {
      const merchantNode = document.createElement('p')
      container.append(merchantNode)
      const handle = addModal()

      expect(Array.from(container.children)).toEqual([merchantNode])

      handle.open()

      expect(Array.from(container.children)).toEqual(modalHostsIn(container))
    })

    it('should mount a modal host on open(), with the default locale', () => {
      const handle = addModal()

      handle.open()

      const [host] = modalHostsIn(container)
      expect(host.firstRender).toMatchObject({
        apiData,
        purchaseAmount: 45000,
        configPlans: undefined,
        locale: Locale.en,
        onClose: handle.close,
      })
      // Rendered before open() returned.
      expect(host.querySelector('[data-testid="placeholder"]')).not.toBeNull()
    })

    it('should give the modal host every option from its first render', () => {
      const cards: Card[] = ['cb', 'visa']
      // No onClose: the host gets handle.close instead.
      const options = {
        plans: [{ installmentsCount: 3, minAmount: 5000, maxAmount: 200000 }],
        customerBillingCountry: 'FR',
        customerShippingCountry: 'DE',
        merchantCoversAllFees: true,
        locale: Locale.de,
        cards,
      }

      const { handle, host } = openModal(options)

      const { plans: configPlans, ...rest } = options
      expect(host.firstRender).toMatchObject({
        apiData,
        purchaseAmount: 45000,
        configPlans,
        ...rest,
        onClose: handle.close,
      })
      expect(host.firstRender).not.toHaveProperty('plans')
      expect(host.firstRender).not.toHaveProperty('clickableSelector')
    })

    it('should keep one modal host for a second open(), with the options of the last handle opened', () => {
      const handle = addModal()
      const { host } = openModal({ purchaseAmount: 90000, locale: Locale.de })

      handle.open()

      expect(modalHostsIn(container)).toEqual([host])
      expect(host.disconnections).toBe(0)
      expect(host).toMatchObject({
        purchaseAmount: 45000,
        locale: Locale.en,
        onClose: handle.close,
      })
    })

    it('should give open() the options of add(), even if the merchant changes them later', () => {
      const options = {
        container: TEST_CONTAINER,
        clickableSelector: '#open',
        purchaseAmount: 45000,
      }
      const handle = widgets().add(Widgets.Modal, options) as ModalHandle
      options.purchaseAmount = 90000

      handle.open()

      const [host] = modalHostsIn(container)
      expect(host.firstRender).toMatchObject({ purchaseAmount: 45000 })
    })

    it('should mount a new modal host on open() after the merchant empties the container', () => {
      const { handle, host: first } = openModal()
      container.replaceChildren()

      handle.open()

      const [second] = modalHostsIn(container)
      expect(second).toBeDefined()
      expect(second).not.toBe(first)
    })

    it('should replace a PaymentPlans host that was added after add(Modal) on open()', () => {
      const handle = addModal()
      addPaymentPlans()
      const [plansHost] = hostsIn(container)

      handle.open()

      expect(plansHost.disconnections).toBe(1)
      expect(Array.from(container.children)).toEqual(modalHostsIn(container))
    })

    it('should let a later add(PaymentPlans) replace the modal host', () => {
      const { host: modalHost } = openModal()

      addPaymentPlans()

      expect(modalHost.disconnections).toBe(1)
      expect(modalHostsIn(container)).toHaveLength(0)
      expect(hostsIn(container)).toHaveLength(1)
    })

    it('should still replace a host that was mounted while the modal host disconnected', () => {
      const { handle, host: modalHost } = openModal()
      modalHost.onDisconnect = () => addPaymentPlans()
      handle.close(new MouseEvent('click'))

      addPaymentPlans()

      expect(hostsIn(container)).toHaveLength(1)
    })
  })

  describe('close(event)', () => {
    it('should remove whatever widget the container holds', () => {
      const handle = addModal()
      addPaymentPlans()
      const [plansHost] = hostsIn(container)

      handle.close(new MouseEvent('click'))

      expect(plansHost.disconnections).toBe(1)
      expect(closeModalOf).toHaveBeenCalledExactlyOnceWith(plansHost)
      expect(container.children).toHaveLength(0)
    })
  })

  describe('a misconfigured add()', () => {
    let warn: MockInstance<typeof console.warn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    const misconfigurations = [
      {
        name: 'a missing container',
        options: { container: '#missing' },
        warning: ['[Alma widgets] add() found no container for "#missing".'],
      },
      {
        name: 'an invalid selector',
        options: { container: '#' },
        warning: [
          '[Alma widgets] add() got an invalid container selector "#".',
          expect.objectContaining({ name: 'SyntaxError' }),
        ],
      },
      {
        name: 'missing options',
        options: undefined,
        warning: ['[Alma widgets] add() was called without options.'],
      },
    ]

    it.each(misconfigurations)(
      'should warn once for $name, throw nothing and return undefined for PaymentPlans',
      ({ options, warning }) => {
        const add = () => widgets().add(Widgets.PaymentPlans, options as WidgetOptions)

        expect([add(), add()]).toEqual([undefined, undefined])

        expect(warn).toHaveBeenCalledOnce()
        expect(warn).toHaveBeenCalledWith(...warning)
        expect(document.querySelector(PAYMENT_PLANS_TAG)).toBeNull()
      },
    )

    it('should warn once for a missing container, throw nothing and return a Modal handle that does nothing', () => {
      const onClose = vi.fn()
      const add = () => addModal({ container: '#missing', onClose })

      const [handle] = [add(), add()]
      handle.open()
      handle.close(new MouseEvent('click'))

      expect(handle).toEqual({ open: expect.any(Function), close: expect.any(Function) })
      expect(document.querySelector(ELIGIBILITY_MODAL_TAG)).toBeNull()
      expect(onClose).not.toHaveBeenCalled()
      expect(warn).toHaveBeenCalledOnce()
      expect(warn).toHaveBeenCalledWith('[Alma widgets] add() found no container for "#missing".')
    })
  })
})
