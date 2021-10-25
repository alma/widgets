import { ApiMode } from 'consts'
import React from 'react'
import { render } from 'react-dom'
import { IntlProvider } from 'react-intl'
import { Plans, widgetTypes } from 'types'
import HowItWorksWidget from 'Widgets/HowItWorks'
import PaymentPlanWidget from 'Widgets/PaymentPlan'

export class WidgetsController {
  constructor(private readonly apiData: { domain: ApiMode; merchantId: string }) {}

  add(
    widget: string,
    {
      container,
      purchaseAmount,
      plans,
    }: { container: string; purchaseAmount: number; plans: Plans[] },
  ): void {
    if (widget === widgetTypes.PaymentPlans) {
      render(
        <IntlProvider messages={{}} locale="fr">
          <PaymentPlanWidget purchaseAmount={purchaseAmount} apiData={this.apiData} plans={plans} />
        </IntlProvider>,
        document.querySelector(container),
      )
    }
    if (widget === widgetTypes.HowItWorks) {
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
