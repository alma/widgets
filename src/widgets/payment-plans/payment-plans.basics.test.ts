import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const defaultRender = async () => {
  await mountWidget('PaymentPlans', { purchaseAmount: 40000 })
  await screen.findByTestId('widget-container')
}

describe('Basic PaymentPlan test', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('displays the button', async () => {
    await defaultRender()

    expect(screen.getByTestId('widget-container')).toBeInTheDocument()
  })

  it('opens the modal on click and close it', async () => {
    await defaultRender()

    await userEvent.click(
      screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      }),
    )
    expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    await userEvent.click(screen.getByTestId('modal-close-button'))
    expect(screen.queryByTestId('modal-close-button')).not.toBeInTheDocument()
  })

  describe('PayNow handle', () => {
    it('should not display P1X button if not specifically asked for from widgets config', async () => {
      await mountWidget('PaymentPlans', { purchaseAmount: 40000, suggestedPaymentPlan: [2] })

      await screen.findByTestId('widget-container')
      expect(screen.queryByText(/Payer maintenant 450,00 €/)).not.toBeInTheDocument()
      expect(screen.getByText(/2 x 225,00 €/)).toBeInTheDocument()
    })
    it('should display P1X button if specifically asked for from widgets config', async () => {
      await mountWidget('PaymentPlans', {
        purchaseAmount: 40000,
        plans: [
          {
            installmentsCount: 1,
            deferredDays: 0,
            deferredMonths: 0,
            minAmount: 5000,
            maxAmount: 90000,
          },
        ],
      })
      await screen.findByTestId('widget-container')
      expect(screen.queryByText(/2 x 225,00 €/)).not.toBeInTheDocument()
      expect(screen.getByText(/Payer maintenant 450,00 €/)).toBeInTheDocument()
    })
  })
})
