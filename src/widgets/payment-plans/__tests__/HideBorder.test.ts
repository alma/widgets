import { screen } from '@testing-library/dom'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

it.each([true, false])(
  'renders the widget without border when expected (hideBorder = %s)',
  async (hideBorder) => {
    server.use(eligibilityPlans(mockButtonPlans))
    await mountWidget('PaymentPlans', { purchaseAmount: 40000, hideBorder, monochrome: true })
    await screen.findByTestId('widget-container')
    expect(screen.getByTestId('widget-container')).toBeInTheDocument()
    if (hideBorder) {
      expect(screen.getByTestId('widget-container').className).toContain('hideBorder')
    } else {
      expect(screen.getByTestId('widget-container').className).not.toContain('hideBorder')
    }
  },
)
