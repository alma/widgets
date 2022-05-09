import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'
import { mockButtonPlans } from 'test/fixtures'

jest.mock('utils/fetch', () => {
  return {
    fetchFromApi: async () => mockButtonPlans,
  }
})

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
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    expect(screen.getByTestId('widget-button')).toBeInTheDocument()
    expect(screen.getByText('J+30').className).toContain('active')
    if (monochrome) {
      expect(screen.getByText('J+30').className).not.toContain('polychrome')
    } else {
      expect(screen.getByText('J+30').className).toContain('polychrome')
    }
  },
)
