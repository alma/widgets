import { html } from 'lit'
import type { MockInstance } from 'vitest'

import { ApiMode, Widgets } from '@/index'
import type { ModalHandle } from '@/public-api/modal-handle'
import { ELIGIBILITY_MODAL_TAG, PAYMENT_PLANS_TAG } from '@/public-api/public-api.const'
import type {
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetOptions,
} from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { TEST_CONTAINER, TEST_MERCHANT_ID } from '@/test/mount-widget'

// Stands in for the real elements, which don't exist yet.
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

    it("should mount a modal host on open(), with master's default locale", () => {
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

    it('should give the modal host every option that master passes, from its first render', () => {
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

    it('should keep one modal host for a second open()', () => {
      const { handle, host: first } = openModal()

      handle.open()

      expect(modalHostsIn(container)).toEqual([first])
      expect(first.disconnections).toBe(0)
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
    it('should remove the current host, then call onClose with the same event', () => {
      let hostsAtClose: number | undefined
      const onClose = vi.fn((_event: MouseEvent | KeyboardEvent) => {
        hostsAtClose = container.children.length
      })
      const { handle, host } = openModal({ onClose })
      const event = new MouseEvent('click')

      handle.close(event)

      expect(host.disconnections).toBe(1)
      expect(onClose).toHaveBeenCalledOnce()
      expect(onClose.mock.calls[0][0]).toBe(event)
      expect(hostsAtClose).toBe(0)
    })

    it('should call onClose even when nothing was mounted', () => {
      const onClose = vi.fn()
      const event = new KeyboardEvent('keydown', { key: 'Escape' })

      addModal({ onClose }).close(event)

      expect(onClose).toHaveBeenCalledWith(event)
    })

    it('should remove whatever widget the container holds, as master does', () => {
      const handle = addModal()
      addPaymentPlans()
      const [plansHost] = hostsIn(container)

      handle.close(new MouseEvent('click'))

      expect(plansHost.disconnections).toBe(1)
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

    it.each(misconfigurations)(
      'should warn once for $name, throw nothing and return a Modal handle that does nothing',
      ({ options, warning }) => {
        const onClose = vi.fn()
        const modalOptions = (options && { ...options, onClose }) as unknown as WidgetOptions
        const add = () => widgets().add(Widgets.Modal, modalOptions) as ModalHandle

        const [handle] = [add(), add()]
        handle.open()
        handle.close(new MouseEvent('click'))

        expect(handle).toEqual({ open: expect.any(Function), close: expect.any(Function) })
        expect(document.querySelector(ELIGIBILITY_MODAL_TAG)).toBeNull()
        expect(onClose).not.toHaveBeenCalled()
        expect(warn).toHaveBeenCalledOnce()
        expect(warn).toHaveBeenCalledWith(...warning)
      },
    )
  })
})
