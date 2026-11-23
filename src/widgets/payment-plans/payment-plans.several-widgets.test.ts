import { screen, waitFor } from '@testing-library/dom'

import { mockButtonPlans } from '@/test/fixtures/plans'
import { eligibilityPlans } from '@/test/msw/eligibility-handlers'
import { server } from '@/test/msw/msw-server'
import { mountWidget } from '@/test/utils/mount-widget'

const addContainer = (id: string) => {
  const container = document.createElement('div')
  container.id = id
  document.body.append(container)
  return `#${id}`
}

describe('PaymentPlans, several widgets on one page', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('should render both widgets, with the same main container ID', async () => {
    await mountWidget('PaymentPlans', {
      purchaseAmount: 40000,
      container: addContainer('alma-widget-first'),
    })
    await mountWidget('PaymentPlans', {
      purchaseAmount: 50000,
      container: addContainer('alma-widget-second'),
    })

    // findAll resolves on the first widget, before the second one's response
    await waitFor(() => expect(screen.getAllByTestId('widget-container')).toHaveLength(2))
    const containers = screen.getAllByTestId('widget-container')

    // Known bug: both widgets get the same ID. Merchant CSS and scripts select it,
    // so only a release that may break them can fix it.
    const widgetIds = containers.map((container) => container.id)
    expect(widgetIds[0]).toBe('alma-widget-payment-plans-main-container')
    expect(widgetIds[1]).toBe('alma-widget-payment-plans-main-container')
  })
})
