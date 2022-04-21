import { screen, waitFor, fireEvent } from '@testing-library/react'
import { ApiMode } from 'consts'
import React from 'react'
import render from 'test'
import PaymentPlanWidget from '..'

/**
 * Checks the basic feature of the widget : it shows and it opens a modal on click.
 */
export default function Basics(): void {
  beforeEach(async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )
    await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
  })

  it('displays the button', () => {
    expect(screen.getByTestId('widget-button')).toBeInTheDocument()
  })

  it('opens the modal on click', async () => {
    fireEvent.click(screen.getByTestId('widget-button'))
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
  })
}
