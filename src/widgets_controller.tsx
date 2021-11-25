import { ApiMode } from 'consts'
import IntlProvider from 'intl/IntlProvider'
import React from 'react'
import { render } from 'react-dom'
import {
  Locale,
  PaymentPlanWidgetOptions,
  WidgetName,
  WidgetNames,
  WidgetOptions,
  widgetTypes,
} from 'types'
import PaymentPlanWidget from 'Widgets/PaymentPlan'

export class WidgetsController {
  constructor(private readonly apiData: { domain: ApiMode; merchantId: string }) {}

  add<T extends WidgetNames>(widget: WidgetName<T>, options: WidgetOptions<T>): void {
    if (widget === widgetTypes.PaymentPlans) {
      const {
        container,
        purchaseAmount,
        plans,
        transitionDelay,
        hideIfNotEligible,
        locale = Locale.en,
      } = options as PaymentPlanWidgetOptions
      render(
        <IntlProvider locale={locale}>
          <PaymentPlanWidget
            purchaseAmount={purchaseAmount}
            apiData={this.apiData}
            configPlans={plans}
            transitionDelay={transitionDelay}
            hideIfNotEligible={hideIfNotEligible}
          />
        </IntlProvider>,
        document.querySelector(container),
      )
    }
    // if (widget === widgetTypes.HowItWorks) {
    //   const { container } = options as HowItWorksWidgetOptions
    //   const modalContainer = document.createElement('div')
    //   document.querySelector(container)?.append(modalContainer)
    //   render(
    //     <IntlProvider messages={getTranslationsByLocale(locale)} locale="fr">
    //       <HowItWorksWidget button={container} />
    //     </IntlProvider>,
    //     modalContainer,
    //   )
    // }
  }
}
