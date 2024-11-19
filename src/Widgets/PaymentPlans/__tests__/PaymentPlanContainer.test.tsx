import React from 'react'

import { screen } from '@testing-library/react'

import { ApiMode } from '@/consts'
import { Widgets } from '@/index'
import render from '@/test'

describe('PaymentPlanContainer', () => {
  const setup = () => {
    render(<div id="alma-widget-payment-plans" />)

    const widgets = Widgets.initialize('11gKoO333vEXacMNMUMUSc4c4g68g2Les4', ApiMode.TEST)
    widgets.add(Widgets.PaymentPlans, {
      container: '#alma-widget-payment-plans',
      purchaseAmount: 400,
    })
  }
  beforeEach(() => {
    setup()
  })

  it('should show the PaymentPlan widget loader', async () => {
    await screen.findByTestId('loader')
  })
})
