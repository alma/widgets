import { PAYMENT_PLANS_TAG, WidgetTypes } from '@/public-api/public-api.const'
import type {
  ApiConfig,
  PaymentPlanWidgetOptions,
  WidgetNames,
  WidgetOptions,
} from '@/public-api/public-api.types'
import { Locale } from '@/shared/i18n/i18n.const'

export type AddReturnType =
  { open: () => void; close: (event: MouseEvent | KeyboardEvent) => void } | undefined

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

export function WidgetsController(apiData: ApiConfig) {
  return {
    add(widget: WidgetNames, options: WidgetOptions): AddReturnType {
      const container = document.querySelector(options.container)
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
        return { open() {}, close() {} }
      }
      return undefined
    },
  }
}
