import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'

describe('PaymentPlan has credit', () => {
  const setUpTest = async () => {
    server.use(eligibilityPlans(mockButtonPlans))
    const { host } = await mountWidget('PaymentPlans', {
      purchaseAmount: 40000,
      plans: [
        {
          installmentsCount: 1,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 2,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 1,
          deferredDays: 30,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 3,
          minAmount: 100,
          maxAmount: 100000,
        },
        {
          installmentsCount: 10,
          minAmount: 100,
          maxAmount: 100000,
        },
      ],
    })
    await screen.findByTestId('widget-container')
    return host as HTMLElement & { updateComplete: Promise<boolean> }
  }

  const infoLine = () => document.getElementById('payment-info-text') as HTMLElement

  it('shows only the know-more line, without the installment breakdown, for a credit plan', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('10x'))

    expect(infoLine()).not.toHaveTextContent('47,77 € puis 9 x 47,72 €')
    expect(infoLine()).toHaveTextContent('Cliquez pour en savoir plus')
  })

  it('leaves a non-deferred P1X plan with a single line', async () => {
    await setUpTest()

    await userEvent.hover(screen.getByText('Payer maintenant'))

    expect(infoLine()).toHaveTextContent('Payer maintenant 450,00 €')
    expect(infoLine()).not.toHaveTextContent('Cliquez pour en savoir plus')
  })
})
