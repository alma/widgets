import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

beforeEach(async () => {
  render(
    <PaymentPlanWidget
      purchaseAmount={40000}
      apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
    />,
  )
  await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
})

describe('Basic PaymentPlan test', () => {
  it('displays the button', () => {
    expect(screen.getByTestId('widget-button')).toBeInTheDocument()
  })

  it('opens the modal on click and close it', async () => {
    await userEvent.click(screen.getByTestId('widget-button'))
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('modal-close-button'))
    expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument()
  })
  describe('PayNow handle', () => {
    it('should not display P1X button if not specifically asked for from widgets config', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          suggestedPaymentPlan={[2]}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      expect(screen.queryByText(/Payer maintenant 450,00 €/)).not.toBeInTheDocument()
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    })
    it('should display P1X button if specifically asked for from widgets config', async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          configPlans={[
            {
              installmentsCount: 1,
              deferredDays: 0,
              deferredMonths: 0,
              minAmount: 5000,
              maxAmount: 90000,
            },
          ]}
        />,
      )
      await waitFor(() => expect(screen.getByTestId('widget-button')).toBeInTheDocument())
      expect(screen.queryByText(/2 x 225,00 €/)).not.toBeInTheDocument()
      expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
    })
  })
})
