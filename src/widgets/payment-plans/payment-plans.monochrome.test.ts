import { screen } from '@testing-library/dom'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

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
    } else {
      expect(screen.getByText('M+1').className).not.toContain('polychrome')
    }
  },
)
