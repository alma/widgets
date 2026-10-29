import { createModalHandle, type ModalHandle } from '@/public-api/modal-handle'
import {
  ELIGIBILITY_MODAL_TAG,
  PAYMENT_PLANS_TAG,
  WidgetTypes,
} from '@/public-api/public-api.const'
import type {
  ApiConfig,
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetNames,
  WidgetOptions,
} from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'
import { warnOnce } from '@/shared/lib/errors'

export type AddReturnType = ModalHandle | undefined

type HostProperties = Record<string, unknown>

// null once removed: the entry stays, so the container is never emptied again.
const hosts = new WeakMap<Element, HTMLElement | null>()

const removeHost = (container: Element): void => {
  const host = hosts.get(container)
  if (host) {
    hosts.set(container, null)
    host.remove()
  }
}

const mountHost = (container: Element, tagName: string, properties: HostProperties): void => {
  const host = document.createElement(tagName)
  // Before append(), so the first render has every option.
  Object.assign(host, properties)
  // Preact empties a container on its first render only.
  if (!hosts.has(container)) {
    container.replaceChildren()
  }
  container.append(host)
  hosts.set(container, host)
}

// Like Preact, the same tag updates in place.
const renderHost = (container: Element, tagName: string, properties: HostProperties): void => {
  const host = hosts.get(container)
  // Detached when the merchant emptied the container.
  if (host?.localName === tagName && host.parentNode === container) {
    Object.assign(host, properties)
    return
  }
  removeHost(container)
  mountHost(container, tagName, properties)
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
        return createModalHandle(modalOptions.onClose, {
          mount: (close) =>
            renderHost(container, ELIGIBILITY_MODAL_TAG, { ...properties, onClose: close }),
          remove: () => removeHost(container),
        })
      }
      return undefined
    },
  }
}
