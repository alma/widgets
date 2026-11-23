import { screen } from '@testing-library/dom'

import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'

it('renders the widget without border when hideBorder is true', async () => {
  server.use(eligibilityPlans(mockButtonPlans))
  await mountWidget('PaymentPlans', { purchaseAmount: 40000, hideBorder: true, monochrome: true })
  await screen.findByTestId('widget-container')

  expect(screen.getByTestId('widget-container').className).toContain('hideBorder')
})
