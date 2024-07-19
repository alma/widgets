import { screen } from '@testing-library/react'
import { ApiMode } from 'consts'
import { Widgets } from 'index'
import { server } from 'mocks/server'
import { rest } from 'msw'
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
    server.use(
      rest.post(`${ApiMode.TEST}/v2/payments/eligibility`, async (req, res, ctx) => {
        return res(ctx.status(200), ctx.json({}), ctx.delay('infinite'))
      }),
    )

    expect(await screen.findByTestId('loader')).toBeInTheDocument()
  })
})
