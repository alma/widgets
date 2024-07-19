import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'
import ReactQueryProvider from 'providers/ReactQuery'

describe('Hide Border', () => {
  it.each([true, false])(
    'renders the widget without border when expected (hideBorder = %s)',
    async (hideBorder) => {
      render(
        <ReactQueryProvider>
          <PaymentPlanWidget
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
            hideBorder={hideBorder}
            monochrome
          />
        </ReactQueryProvider>,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      expect(screen.getByTestId('widget-button')).toBeInTheDocument()
      if (hideBorder) {
        expect(screen.getByTestId('widget-button').className).toContain('hideBorder')
      } else {
        expect(screen.getByTestId('widget-button').className).not.toContain('hideBorder')
      }
    },
  )
})
