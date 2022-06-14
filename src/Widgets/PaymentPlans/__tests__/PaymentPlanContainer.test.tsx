import { screen, waitFor } from '@testing-library/react'
import { ApiMode } from 'consts'
import { Widgets } from 'index'
import React from 'react'
import render from 'test'

describe('PaymentPlanContainer', () => {
  beforeEach(() => {
    render(<div id="alma-widget-payment-plans"></div>)

    const widgets = Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', ApiMode.TEST)
    widgets.add(Widgets.PaymentPlans, {
      container: '#alma-widget-payment-plans',
      purchaseAmount: 400,
    })
  })

  it('should show the PaymentPlan widget loader', async () => {
    await waitFor(() => expect(screen.getByTestId('loader')).toBeInTheDocument())
  })
})
