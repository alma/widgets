import React from 'react'

import { screen, waitFor } from '@testing-library/react'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

describe('Hide if not applicable', () => {
  it('hides if hideIfNotEligible is true', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        hideIfNotEligible
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
})
