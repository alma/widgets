import React from 'react'
import { render } from 'react-dom'
import PaymentPlanWidget from 'Widgets/PaymentPlan'

import { ApiMode } from 'consts'
import HowItWorksWidget from 'Widgets/HowItWorks'
import { widgetTypes } from 'types'

export class WidgetsController {
  constructor(private readonly apiData: { domain: ApiMode; merchantId: string }) {}

  add(
    widget: string,
    { container, purchaseAmount }: { container: string; purchaseAmount: number },
  ): void {
    if (widget === widgetTypes.PaymentPlans) {
      render(
        <PaymentPlanWidget purchaseAmount={purchaseAmount} apiData={this.apiData} />,
        document.querySelector(container),
      )
    }
    if (widget === widgetTypes.HowItWorks) {
      const modalContainer = document.createElement('div')
      document.querySelector(container)?.append(modalContainer)
      render(<HowItWorksWidget button={container} />, modalContainer)
    }
  }
}
