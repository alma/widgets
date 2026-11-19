import { screen } from '@testing-library/dom'

import { eligibilityPending } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'

describe('PaymentPlanContainer', () => {
  const setup = async () => {
    const container = document.createElement('div')
    container.id = 'alma-widget-payment-plans'
    document.body.append(container)

    await mountWidget('PaymentPlans', {
      container: '#alma-widget-payment-plans',
      purchaseAmount: 400,
    })
  }

  beforeEach(async () => {
    server.use(eligibilityPending())
    await setup()
  })

  it('should show the PaymentPlan widget loader', async () => {
    await screen.findByTestId('loader')
  })
})
