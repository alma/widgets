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

export class WidgetsController {
  private rootMap: Map<Element, Root> = new Map()

  constructor(private readonly apiData: { domain: ApiMode; merchantId: string }) {
    this.apiData = apiData
  }

  add(widget: WidgetNames, options: WidgetOptions): AddReturnType {
    const containerDiv = document.querySelector(options.container)

    if (containerDiv) {
      const existingRoot = this.rootMap.get(containerDiv)
      if (existingRoot) {
        existingRoot.unmount()
        this.rootMap.delete(containerDiv)
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
              apiData={this.apiData}
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
        this.rootMap.set(containerDiv, root)
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
        const root = this.rootMap.get(containerDiv)
        if (root) {
          root.unmount()
          this.rootMap.delete(containerDiv)
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
                apiData={this.apiData}
                configPlans={plans}
                customerBillingCountry={customerBillingCountry}
                customerShippingCountry={customerShippingCountry}
                onClose={close}
                cards={cards}
              />
            </IntlProvider>,
          )
          this.rootMap.set(containerDiv, root)
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
}
