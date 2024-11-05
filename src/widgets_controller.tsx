import React from 'react'

import { createRoot, Root } from 'react-dom/client'

import { ApiMode } from '@/consts'
import {
  Locale,
  ModalOptions,
  PaymentPlanWidgetOptions,
  WidgetNames,
  WidgetOptions,
  widgetTypes,
} from '@/types'
import IntlProvider from 'intl/IntlProvider'
import { ModalContainer } from 'Widgets/EligibilityModal/ModalContainer'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

export type AddReturnType =
  | {
      open: () => void
      close: (event: React.MouseEvent | React.KeyboardEvent) => void
    }
  | undefined

type ApiData = { domain: ApiMode; merchantId: string }

const rootMap: Map<Element, Root> = new Map()

const addWidget = (
  apiData: ApiData,
  widget: WidgetNames,
  options: WidgetOptions,
): AddReturnType => {
  const containerDiv = document.querySelector(options.container)

  if (containerDiv) {
    const existingRoot = rootMap.get(containerDiv)
    if (existingRoot) {
      existingRoot.unmount()
      rootMap.delete(containerDiv)
    }
  }

  if (widget === widgetTypes.PaymentPlans) {
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
      locale = Locale.en,
      cards,
      onModalClose,
    } = options as PaymentPlanWidgetOptions

    if (containerDiv) {
      const root = createRoot(containerDiv)
      root.render(
        <IntlProvider locale={locale}>
          <PaymentPlanWidget
            apiData={apiData}
            configPlans={plans}
            hideIfNotEligible={hideIfNotEligible}
            monochrome={monochrome}
            purchaseAmount={purchaseAmount}
            suggestedPaymentPlan={suggestedPaymentPlan}
            cards={cards}
            customerBillingCountry={customerBillingCountry}
            customerShippingCountry={customerShippingCountry}
            transitionDelay={transitionDelay}
            hideBorder={hideBorder}
            onModalClose={onModalClose}
          />
        </IntlProvider>,
      )
      rootMap.set(containerDiv, root)
    }
  }

  if (widget === widgetTypes.Modal) {
    const {
      clickableSelector,
      purchaseAmount,
      plans,
      locale = Locale.en,
      customerBillingCountry,
      customerShippingCountry,
      cards,
      onClose,
    } = options as ModalOptions

    const close = (event: React.MouseEvent | React.KeyboardEvent) => {
      if (!containerDiv) return
      const root = rootMap.get(containerDiv)
      if (root) {
        root.unmount()
        rootMap.delete(containerDiv)
      }
      onClose?.(event)
    }

    const renderModal = () => {
      if (containerDiv) {
        const root = createRoot(containerDiv)
        root.render(
          <IntlProvider locale={locale}>
            <ModalContainer
              purchaseAmount={purchaseAmount}
              apiData={apiData}
              configPlans={plans}
              customerBillingCountry={customerBillingCountry}
              customerShippingCountry={customerShippingCountry}
              onClose={close}
              cards={cards}
            />
          </IntlProvider>,
        )
        rootMap.set(containerDiv, root)
      }
    }

    if (clickableSelector) {
      document.querySelector(clickableSelector)?.addEventListener('click', renderModal, false)
    }

    return {
      open: renderModal,
      close,
    }
  }

  return undefined
}

export const WidgetsController = (apiData: ApiData) => ({
  add: (widget: WidgetNames, options: WidgetOptions) => addWidget(apiData, widget, options),
})
