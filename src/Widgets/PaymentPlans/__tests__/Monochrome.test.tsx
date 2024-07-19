import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'
import ReactQueryProvider from 'providers/ReactQuery'

it.each([true, false])(
  'renders the monochrome version of the widget when expected',
  async (monochrome) => {
    render(
      <ReactQueryProvider>
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          monochrome={monochrome}
        />
      </ReactQueryProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
    expect(screen.getByTestId('widget-button')).toBeInTheDocument()
    expect(screen.getByText('M+1').className).toContain('active')
    if (monochrome) {
      expect(screen.getByText('M+1').className).toContain('monochrome')
    } else {
      expect(screen.getByText('M+1').className).not.toContain('polychrome')
    }
  },
)
