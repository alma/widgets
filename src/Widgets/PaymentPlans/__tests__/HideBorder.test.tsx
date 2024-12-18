import React from 'react'

import { screen } from '@testing-library/react'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

it.each([true, false])(
  'renders the widget without border when expected (hideBorder = %s)',
  async (hideBorder) => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        hideBorder={hideBorder}
        monochrome
      />,
    )
    await screen.findByTestId('widget-button')
    expect(screen.getByTestId('widget-button')).toBeInTheDocument()
    if (hideBorder) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.getByTestId('widget-button').className).toContain('hideBorder')
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.getByTestId('widget-button').className).not.toContain('hideBorder')
    }
  },
)
