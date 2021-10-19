import React from 'react'
import { render } from 'react-dom'
import PaymentPlanWidget from './Widgets/PaymentPlan.widget'

export class WidgetsController {
  constructor(private readonly apiConnection: { apiMode: string; merchantId: string }) {}

  add(
    widget: string,
    { container, purchaseAmount }: { container: string; purchaseAmount: number },
  ): void {
    render(<PaymentPlanWidget purchaseAmount={purchaseAmount} />, document.querySelector(container))
  }
}
