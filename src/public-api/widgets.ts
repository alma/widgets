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

const hosts = new WeakMap<Element, HTMLElement>()
// Preact empties a container on its first render only, so later mounts keep the merchant's nodes.
const renderedContainers = new WeakSet<Element>()

const removeHost = (container: Element): void => {
  hosts.get(container)?.remove()
  hosts.delete(container)
}

const mountHost = (container: Element, tagName: string, properties: HostProperties): void => {
  const host = document.createElement(tagName)
  // Before append(), so the first render has every option.
  Object.assign(host, properties)
  if (!renderedContainers.has(container)) {
    container.replaceChildren()
    renderedContainers.add(container)
  }
  container.append(host)
  hosts.set(container, host)
}

// As Preact does, a second open() updates the open modal instead of mounting another one.
const renderModalHost = (container: Element, properties: HostProperties): void => {
  const host = hosts.get(container)
  if (host?.localName === ELIGIBILITY_MODAL_TAG) {
    Object.assign(host, properties)
    return
  }
  removeHost(container)
  mountHost(container, ELIGIBILITY_MODAL_TAG, properties)
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
  close: ModalHandle['close'],
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
    onClose: close,
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
      const container = findContainer(options as WidgetOptions | undefined)
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
        return createModalHandle(container, modalOptions.onClose, {
          mountModal: (target, close) =>
            renderModalHost(target, toEligibilityModalHostProperties(apiData, modalOptions, close)),
          removeHost,
        })
      }
      return undefined
    },
  }
}
