import { createModalHandle, type ModalHandle, openOnClick } from '@/public-api/modal-handle'
import { WidgetTypes } from '@/public-api/public-api.const'
import type {
  ApiConfig,
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetNames,
  WidgetOptions,
} from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import { warnOnce } from '@/shared/lib/errors'
import { ELIGIBILITY_MODAL_TAG } from '@/widgets/eligibility-modal/eligibility-modal.const'
// Also registers <alma-eligibility-modal>, which add() creates by its tag.
import { closeModalOf } from '@/widgets/eligibility-modal/index'
// Registers <alma-payment-plans>, which add() creates by its tag.
import '@/widgets/payment-plans'
import { PAYMENT_PLANS_TAG } from '@/widgets/payment-plans/payment-plans.const'

export type AddReturnType = ModalHandle | undefined

type HostProperties = Record<string, unknown>

// null once removed: the entry stays, so add(PaymentPlans) never empties the container again.
const hosts = new WeakMap<Element, HTMLElement | null>()

const removeHost = (container: Element): void => {
  const host = hosts.get(container)
  if (host) {
    hosts.set(container, null)
    host.remove()
    closeModalOf(host)
  }
}

// Preact empties a container on its first render only.
const mountHost = (
  container: Element,
  tagName: string,
  properties: HostProperties,
  empty = !hosts.has(container),
): void => {
  const host = document.createElement(tagName)
  // Before append(), so the first render has every option.
  Object.assign(host, properties)
  if (empty) {
    container.replaceChildren()
  }
  container.append(host)
  hosts.set(container, host)
}

// False once the merchant has emptied the container.
const hasHost = (container: Element, tagName: string): boolean => {
  const host = hosts.get(container)
  return host?.localName === tagName && host.parentNode === container
}

// Master's PaymentPlanWidget props and defaults.
const toPaymentPlansHostProperties = (
  apiData: ApiConfig,
  options: PaymentPlanWidgetOptions,
): HostProperties => {
  const {
    purchaseAmount,
    plans,
    transitionDelay,
    hideIfNotEligible,
    hideBorder = false,
    monochrome = true,
    suggestedPaymentPlan,
    customerBillingCountry,
    customerShippingCountry,
    merchantCoversAllFees,
    locale = Locale.en,
    cards,
    onModalClose,
  } = options
  return {
    apiData,
    configPlans: plans,
    hideIfNotEligible,
    monochrome,
    purchaseAmount,
    suggestedPaymentPlan,
    cards,
    customerBillingCountry,
    customerShippingCountry,
    merchantCoversAllFees,
    transitionDelay,
    hideBorder,
    onModalClose,
    locale,
  }
}

const toEligibilityModalHostProperties = (
  apiData: ApiConfig,
  options: ModalOptions,
): HostProperties => {
  const {
    purchaseAmount,
    plans,
    locale = Locale.en,
    customerBillingCountry,
    customerShippingCountry,
    merchantCoversAllFees,
    cards,
  } = options
  return {
    purchaseAmount,
    apiData,
    configPlans: plans,
    customerBillingCountry,
    customerShippingCountry,
    merchantCoversAllFees,
    cards,
    locale,
  }
}

// Master throws for missing options or an invalid selector.
// The port warns and carries on without a container.
const findContainer = (options: WidgetOptions | undefined): Element | null => {
  if (!options) {
    warnOnce('add() was called without options.')
    return null
  }
  try {
    const container = document.querySelector(options.container)
    if (!container) {
      warnOnce(`add() found no container for "${options.container}".`)
    }
    return container
  } catch (error) {
    warnOnce(`add() got an invalid container selector "${options.container}".`, error)
    return null
  }
}

export function WidgetsController(apiData: ApiConfig) {
  return {
    add(widget: WidgetNames, options: WidgetOptions): AddReturnType {
      const container = findContainer(options)
      // Before the name check: on master, even an unknown name removes the widget.
      if (container) {
        removeHost(container)
      }
      if (widget === WidgetTypes.PaymentPlans) {
        if (!container) {
          return undefined
        }

        const properties = toPaymentPlansHostProperties(
          apiData,
          options as PaymentPlanWidgetOptions,
        )
        mountHost(container, PAYMENT_PLANS_TAG, properties)
        return undefined
      }
      if (widget === WidgetTypes.Modal) {
        if (!container) {
          return { open() {}, close() {} }
        }
        const modalOptions = options as ModalOptions
        // Read now, not at open(), as master does.
        const properties = toEligibilityModalHostProperties(apiData, modalOptions)
        const handle = createModalHandle(modalOptions.onClose, {
          render: (close) => {
            const hostProperties = { ...properties, onClose: close }
            const host = hosts.get(container)
            // Master's render updates the modal in place, with no new request once it has plans.
            if (host && hasHost(container, ELIGIBILITY_MODAL_TAG)) {
              Object.assign(host, hostProperties)
              return
            }
            removeHost(container)
            mountHost(container, ELIGIBILITY_MODAL_TAG, hostProperties, true)
          },
          remove: () => removeHost(container),
        })
        if (modalOptions.clickableSelector) {
          openOnClick(modalOptions.clickableSelector, handle.open)
        }
        return handle
      }
      return undefined
    },
  }
}
