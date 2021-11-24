import { ApiMode } from 'consts'
import React from 'react'
import { render } from 'react-dom'
import { IntlProvider } from 'react-intl'
import {
  HowItWorksWidgetOptions,
  PaymentPlanWidgetOptions,
  WidgetName,
  WidgetNames,
  WidgetOptions,
  widgetTypes,
} from 'types'
import HowItWorksWidget from 'Widgets/HowItWorks'
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
      } = options as PaymentPlanWidgetOptions
      render(
        <IntlProvider messages={{}} locale="fr">
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
    if (widget === widgetTypes.HowItWorks) {
      const { container } = options as HowItWorksWidgetOptions
      const modalContainer = document.createElement('div')
      document.querySelector(container)?.append(modalContainer)
      render(
        <IntlProvider messages={{}} locale="fr">
          <HowItWorksWidget button={container} />
        </IntlProvider>,
        modalContainer,
      )
    }
  }
}
