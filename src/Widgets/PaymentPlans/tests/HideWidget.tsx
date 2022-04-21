import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'

/**
 * Tests that the widget hides completly if option is set to true or there is no plan.
 */
export default function HideWidget(): void {
  it('hides if hideIfNotEligible is true', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        hideIfNotEligible={true}
        configPlans={[
          {
            installmentsCount: 1,
            minAmount: 100,
            maxAmount: 100000,
          },
        ]}
      />,
    )
    await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
  })
  it('hides if hideIfNotEligible is not specified', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        configPlans={[
          {
            installmentsCount: 1,
            minAmount: 100,
            maxAmount: 100000,
          },
        ]}
      />,
    )
    await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
  })
  it('hides if there is no plan', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        configPlans={[]}
      />,
    )
    await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
  })
}
