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
  'renders the monochrome version of the widget when expected',
  async (monochrome) => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        monochrome={monochrome}
      />,
    )
    await screen.findByTestId('widget-container')
    expect(screen.getByTestId('widget-container')).toBeInTheDocument()
    expect(screen.getByText('M+1').className).toContain('active')
    if (monochrome) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.getByText('M+1').className).toContain('monochrome')
    } else {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(screen.getByText('M+1').className).not.toContain('polychrome')
    }
  },
)
