import { screen, waitFor } from '@testing-library/dom'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

describe('Hide if not applicable', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('hides if hideIfNotEligible is true', async () => {
    await mountWidget('PaymentPlans', {
      purchaseAmount: 40000,
      hideIfNotEligible: true,
      plans: [
        {
          installmentsCount: 1,
          minAmount: 100,
          maxAmount: 100000,
        },
      ],
    })
    await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
  })
  it('hides if hideIfNotEligible is not specified', async () => {
    await mountWidget('PaymentPlans', {
      purchaseAmount: 40000,
      plans: [
        {
          installmentsCount: 1,
          minAmount: 100,
          maxAmount: 100000,
        },
      ],
    })
    await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
  })
  it('hides if there is no plan', async () => {
    await mountWidget('PaymentPlans', { purchaseAmount: 40000, plans: [] })
    await waitFor(() => expect(screen.queryByTestId('widget-button')).not.toBeInTheDocument())
  })
})
