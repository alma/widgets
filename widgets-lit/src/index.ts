import { ApiMode } from './constants'
import { formatPrice } from './utils'
import './components/payment-plans'
import './components/modal'
import type { AlmaModal } from './components/modal'

type AttributeValue = string | number | boolean
type JsonAttributeValue = unknown

/**
 * Generic attribute setter with removal logic
 * Consolidates repetitive attribute-setting patterns
 */
const setAttribute = (
  el: HTMLElement,
  name: string,
  value: AttributeValue | unknown,
  options: {
    isBoolean?: boolean
    isJson?: boolean
    shouldRemove?: (val: unknown) => boolean
  } = {},
) => {
  const { isBoolean = false, isJson = false, shouldRemove = (v) => !v } = options

  if (value === undefined || shouldRemove(value)) {
    el.removeAttribute(name)
    return
  }

  if (isBoolean) {
    el.setAttribute(name, '')
  } else if (isJson) {
    el.setAttribute(name, JSON.stringify(value))
  } else {
    el.setAttribute(name, String(value))
  }
}

// Convenience functions for backwards compatibility (thin wrappers)
const setAttributeOrRemove = (
  el: HTMLElement,
  name: string,
  value: AttributeValue | undefined,
  shouldSet: (value: AttributeValue) => boolean = Boolean,
) => {
  setAttribute(el, name, value, {
    shouldRemove: (v) => !shouldSet(v as AttributeValue),
  })
}

const setJsonAttributeOrRemove = (el: HTMLElement, name: string, value: unknown) => {
  setAttribute(el, name, value, { isJson: true })
}

const setJsonAttributeIfDefined = (el: HTMLElement, name: string, value: JsonAttributeValue) => {
  setAttribute(el, name, value, { isJson: true, shouldRemove: (v) => v === undefined })
}

const setAttributeIfDefined = (
  el: HTMLElement,
  name: string,
  value: AttributeValue | undefined,
) => {
  setAttribute(el, name, value, { shouldRemove: (v) => v === undefined })
}

const setBooleanAttributeIfDefined = (
  el: HTMLElement,
  name: string,
  value: boolean | undefined,
) => {
  setAttribute(el, name, value, {
    isBoolean: true,
    shouldRemove: (v) => v === undefined,
  })
}

// ---------------------------------------------------------------------------
// WeakSets for tracking event listener attachment.
// Using WeakSets instead of custom DOM property flags avoids naming collisions
// and allows garbage collection when elements are removed from the DOM.
// ---------------------------------------------------------------------------
const autoModalListeners = new WeakSet<HTMLElement>()
const manualModalListeners = new WeakSet<HTMLElement>()
const clickableListeners = new WeakSet<Element>()

/**
 * Sync configuration attributes from a PaymentPlans widget element to a modal element.
 * Centralises the attribute-mirroring logic that was previously duplicated in both
 * the auto-modal and manual-modal event listeners.
 */
const syncConfigToModal = (modal: HTMLElement, widget: HTMLElement) => {
  const passthroughAttrs = [
    'plans',
    'cards',
    'customer-billing-country',
    'customer-shipping-country',
  ]
  for (const attr of passthroughAttrs) {
    const value = widget.getAttribute(attr)
    if (value !== null) {
      modal.setAttribute(attr, value)
    } else {
      modal.removeAttribute(attr)
    }
  }

  // Boolean attribute: presence = true, absence = false
  if (widget.hasAttribute('merchant-covers-all-fees')) {
    modal.setAttribute('merchant-covers-all-fees', '')
  } else {
    modal.removeAttribute('merchant-covers-all-fees')
  }
}

/**
 * Alma Widgets Library - Optimized with Lit Web Components
 *
 * This is the main entry point for the Alma Widgets library.
 * It provides a simple API to add payment widgets to any web page.
 */

class AlmaWidgets {
  constructor(merchantId: string, apiMode: ApiMode = ApiMode.TEST) {
    // Store config globally so Web Components can access it.
    // Web Components run in isolated scope (Shadow DOM) and need merchant
    // credentials for API calls without constructor injection.
    ;(window as any).__ALMA_WIDGET_CONFIG__ = { merchantId, apiMode }
  }

  /**
   * Add a Payment Plans widget to the page
   *
   * This widget displays available payment plans (3x, 4x, deferred, etc.)
   * and can automatically open a modal when users click on a plan.
   */
  public addPaymentPlans(options: {
    container: string
    purchaseAmount: number
    locale?: string
    plans?: Array<{
      installmentsCount: number
      deferredDays?: number
      deferredMonths?: number
      minAmount: number
      maxAmount: number
    }>
    hideIfNotEligible?: boolean
    monochrome?: boolean
    hideBorder?: boolean
    cards?: Array<'cb' | 'amex' | 'mastercard' | 'visa'>
    transitionDelay?: number
    suggestedPaymentPlan?: number | number[]
    customerBillingCountry?: string
    customerShippingCountry?: string
    merchantCoversAllFees?: boolean
    modalSelector?: string // CSS selector for modal to open on plan click
    onModalClose?: () => void // Callback fired when the auto-modal closes
  }): void {
    const container = document.querySelector(options.container)
    if (!container) {
      console.error(`Container ${options.container} not found`)
      return
    }

    // Reuse existing widget instance when possible to avoid re-mounting.
    // This is a key performance win versus the Preact implementation.
    let widget = container.querySelector('alma-payment-plans') as HTMLElement | null
    if (!widget) {
      // If the container has other content, we still clear it once during first mount.
      container.innerHTML = ''
      widget = document.createElement('alma-payment-plans')
      container.appendChild(widget)
    }

    // Update reactive properties/attributes (Lit will re-render automatically).
    ;(widget as any).purchaseAmount = options.purchaseAmount

    setAttributeOrRemove(widget, 'locale', options.locale)
    setJsonAttributeOrRemove(widget, 'plans', options.plans)

    if (options.hideIfNotEligible !== undefined)
      (widget as any).hideIfNotEligible = options.hideIfNotEligible
    if (options.monochrome !== undefined) (widget as any).monochrome = options.monochrome
    if (options.hideBorder !== undefined) (widget as any).hideBorder = options.hideBorder

    setJsonAttributeOrRemove(widget, 'cards', options.cards)

    setAttributeIfDefined(widget, 'transition-delay', options.transitionDelay)
    setJsonAttributeIfDefined(widget, 'suggested-payment-plan', options.suggestedPaymentPlan)

    setAttributeOrRemove(widget, 'customer-billing-country', options.customerBillingCountry)
    setAttributeOrRemove(widget, 'customer-shipping-country', options.customerShippingCountry)

    // Keep API payload consistent with the Preact widget
    setBooleanAttributeIfDefined(widget, 'merchant-covers-all-fees', options.merchantCoversAllFees)

    // --- Modal wiring ---
    const hasAutoModal = !options.modalSelector

    if (hasAutoModal) {
      // Create or reuse the auto-generated modal container (stored by data attribute).
      const existingModalId = widget.getAttribute('data-alma-auto-modal-id')
      let modalContainer: HTMLElement | null = null

      if (existingModalId) {
        modalContainer = document.getElementById(existingModalId)
      }

      if (!modalContainer) {
        modalContainer = document.createElement('div')
        modalContainer.id = `alma-modal-${Date.now()}`
        modalContainer.style.display = 'contents'

        widget.setAttribute('data-alma-auto-modal-id', modalContainer.id)

        if (container.parentElement) {
          container.parentElement.insertBefore(modalContainer, container.nextSibling)
        } else {
          document.body.appendChild(modalContainer)
        }
      }

      // Create or reuse the modal element.
      let modal = modalContainer.querySelector('alma-modal') as AlmaModal | null
      if (!modal) {
        modal = document.createElement('alma-modal') as AlmaModal
        modalContainer.appendChild(modal)
      }

      // Keep modal in sync with the widget configuration.
      modal.purchaseAmount = options.purchaseAmount
      setAttributeOrRemove(modal, 'locale', options.locale)
      syncConfigToModal(modal, widget)

      // Wire optional onModalClose callback (Preact API parity).
      if (options.onModalClose) {
        modal.addEventListener('modal-closed', options.onModalClose)
      }

      // Add a single listener to open the modal on plan click.
      if (!autoModalListeners.has(widget)) {
        autoModalListeners.add(widget)

        widget.addEventListener('plan-selected', (e: Event) => {
          const event = e as CustomEvent
          const selectedPlan = event.detail?.plan
          const purchaseAmount = event.detail?.purchaseAmount

          if (purchaseAmount !== undefined) {
            modal!.purchaseAmount = purchaseAmount
          }

          // Keep the modal strictly aligned with the PaymentPlans configuration.
          // We read from the PaymentPlans element itself to avoid any mismatch when
          // the host calls addPaymentPlans() repeatedly or mutates attributes directly.
          syncConfigToModal(modal as HTMLElement, widget as HTMLElement)

          // Open modal on the right plan.
          if (selectedPlan && typeof modal!.openWithPlan === 'function') {
            modal!.openWithPlan(selectedPlan)
          } else {
            modal!.open()
          }
        })
      }

      return
    }

    // Manual modal wiring: connect to a modal provided by the host page.
    if (options.modalSelector && !manualModalListeners.has(widget)) {
      manualModalListeners.add(widget)

      const modalSelector = options.modalSelector
      widget.addEventListener('plan-selected', (e: Event) => {
        const event = e as CustomEvent
        const selectedPlan = event.detail?.plan
        const purchaseAmount = event.detail?.purchaseAmount

        const modal = document.querySelector(modalSelector) as AlmaModal | null
        if (!modal || typeof modal.open !== 'function') {
          console.error(
            `[PaymentPlans] Modal not found or missing open() method. Selector: ${modalSelector}`,
          )
          return
        }

        if (purchaseAmount !== undefined) {
          modal.purchaseAmount = purchaseAmount
        }

        // Keep the modal strictly aligned with the PaymentPlans configuration (manual mode).
        syncConfigToModal(modal, widget as HTMLElement)

        // Open modal with the selected plan
        if (selectedPlan && typeof modal.openWithPlan === 'function') {
          modal.openWithPlan(selectedPlan)
        } else {
          modal.open()
        }
      })
    }
  }

  /**
   * Add a Modal widget to the page
   *
   * This modal displays detailed payment schedules when opened.
   * It can be triggered by:
   * - Payment Plans widget (via modalSelector)
   * - External buttons/links (via clickableSelector)
   * - Programmatically (via returned open/close methods)
   */
  public addModal(options: {
    container: string
    purchaseAmount: number
    clickableSelector?: string
    locale?: string
    plans?: Array<{
      installmentsCount: number
      deferredDays?: number
      deferredMonths?: number
      minAmount: number
      maxAmount: number
    }>
    cards?: Array<'cb' | 'amex' | 'mastercard' | 'visa'>
    customerBillingCountry?: string
    customerShippingCountry?: string
    merchantCoversAllFees?: boolean
    onOpen?: () => void
    onClose?: () => void
    onModalClose?: () => void
  }): { open: () => void; close: () => void } {
    const container = document.querySelector(options.container)
    if (!container) {
      console.error(`Container ${options.container} not found`)
      return { open: () => {}, close: () => {} }
    }

    // Reuse existing modal instance when possible to avoid re-mounting.
    let modal = container.querySelector('alma-modal') as AlmaModal | null
    if (!modal) {
      container.innerHTML = ''
      modal = document.createElement('alma-modal') as AlmaModal
      container.appendChild(modal)
    }

    // Update reactive properties/attributes
    modal.purchaseAmount = options.purchaseAmount

    setAttributeOrRemove(modal, 'locale', options.locale)
    setJsonAttributeOrRemove(modal, 'plans', options.plans)
    setJsonAttributeOrRemove(modal, 'cards', options.cards)
    setAttributeOrRemove(modal, 'customer-billing-country', options.customerBillingCountry)
    setAttributeOrRemove(modal, 'customer-shipping-country', options.customerShippingCountry)
    setBooleanAttributeIfDefined(modal, 'merchant-covers-all-fees', options.merchantCoversAllFees)

    // Optional: Setup external triggers (buttons/links that open the modal)
    // Avoid attaching duplicate listeners when addModal() is called multiple times.
    if (options.clickableSelector) {
      const clickables = document.querySelectorAll(options.clickableSelector)
      clickables.forEach((el) => {
        if (clickableListeners.has(el)) return
        clickableListeners.add(el)

        el.addEventListener('click', (e) => {
          e.preventDefault()
          modal!.open()
        })
      })
    }

    // Optional: Setup lifecycle callbacks (backward-compatible with Preact naming)
    if (options.onOpen) {
      modal.addEventListener('modal-opened', options.onOpen)
    }

    // Support both onClose (Lit) and onModalClose (Preact naming) for easier migration.
    const onClose = options.onClose ?? options.onModalClose
    if (onClose) {
      modal.addEventListener('modal-closed', onClose)
    }

    return {
      open: () => modal!.open(),
      close: () => modal!.close(),
    }
  }
}

// Global API - this is what developers use
export const Alma = {
  Widgets: {
    /**
     * Initialize the Alma Widgets library
     *
     * Usage:
     *   const widgets = Alma.Widgets.initialize('YOUR_MERCHANT_ID', Alma.ApiMode.LIVE)
     *   widgets.add(Alma.Widgets.PaymentPlans, { ... })
     */
    initialize(merchantId: string, apiMode: ApiMode = ApiMode.TEST) {
      const widgets = new AlmaWidgets(merchantId, apiMode)

      return {
        // Generic add method (uses constants like Alma.Widgets.PaymentPlans)
        add(
          widgetType: 'PaymentPlans' | 'Modal',
          options: any,
        ): void | { open: () => void; close: () => void } {
          if (widgetType === 'PaymentPlans') {
            widgets.addPaymentPlans(options)
          } else if (widgetType === 'Modal') {
            return widgets.addModal(options)
          }
        },
        // Direct methods (alternative API)
        addPaymentPlans: widgets.addPaymentPlans.bind(widgets),
        addModal: widgets.addModal.bind(widgets),
      }
    },
    // Constants for widget types (used with add() method)
    PaymentPlans: 'PaymentPlans' as const,
    Modal: 'Modal' as const,
  },

  /**
   * Utility functions for price formatting and conversion.
   * Mirrors the Alma.Utils namespace from the Preact widget for API parity.
   */
  Utils: {
    /** Convert a decimal price (e.g. 12.50) to centimes (1250) */
    priceToCents: (price: number): number => Math.round(price * 100),
    /** Convert centimes (1250) to a decimal price (12.50) */
    priceFromCents: (cents: number): number => cents / 100,
    /** Format centimes as a localized currency string (e.g. "12,50 €") */
    formatCents: (cents: number, locale = 'fr'): string => formatPrice(cents, locale),
  },

  ApiMode,
}

// Expose to window for UMD/script tag usage
// This makes Alma.Widgets available globally
if (typeof window !== 'undefined') {
  ;(window as any).Alma = Alma
}

// Export for ESM/module usage
export { ApiMode }
export default Alma
