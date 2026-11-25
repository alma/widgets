import { screen } from '@testing-library/dom'

import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'

it.each([true, false])(
  'renders the monochrome version of the widget when expected',
  async (monochrome) => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', { purchaseAmount: 40000, monochrome })
    await screen.findByTestId('widget-container')
    expect(screen.getByTestId('widget-container')).toBeInTheDocument()
    expect(screen.getByText('M+1').className).toContain('active')
    if (monochrome) {
      expect(screen.getByText('M+1').className).toContain('monochrome')
    }
  },
)
