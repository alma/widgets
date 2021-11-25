import { ApiMode } from 'consts'
import { getTranslationsByLocale } from 'intl/utils'
import React from 'react'
import { render } from 'react-dom'
import { IntlProvider } from 'react-intl'
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
        hideIfNotApplicable,
        locale = Locale.en,
      } = options as PaymentPlanWidgetOptions
      render(
        <IntlProvider messages={getTranslationsByLocale(locale)} locale={locale}>
          <PaymentPlanWidget
            purchaseAmount={purchaseAmount}
            apiData={this.apiData}
            configPlans={plans}
            transitionDelay={transitionDelay}
            hideIfNotApplicable={hideIfNotApplicable}
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
