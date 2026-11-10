import { screen } from '@testing-library/dom'
import { axe } from 'vitest-axe'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget, TEST_CONTAINER } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

describe('Payment info line (know more link)', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  // 10x is a credit, which needs the legal disclosure of the modal.
  const renderWithKnowMoreHint = async () => {
    await mountWidget('PaymentPlans', { purchaseAmount: 40000, suggestedPaymentPlan: 10 })
    await screen.findByTestId('widget-container')
  }

  it('exposes the info line as an accessible button when the plan is eligible', async () => {
    await renderWithKnowMoreHint()

    const infoText = document.getElementById('payment-info-text')
    expect(infoText).toHaveAttribute('role', 'button')
    expect(infoText).toHaveAttribute('tabindex', '0')
    expect(infoText).toHaveAttribute('aria-haspopup', 'dialog')
    expect(infoText?.textContent).toMatch(/en savoir plus/i)
  })

  it.todo('opens the modal when the info line is clicked')

  it.todo('opens the modal when the info line is activated with the keyboard')

  it('has no accessibility violations with the clickable info line', async () => {
    await renderWithKnowMoreHint()

    const results = await axe(document.querySelector(TEST_CONTAINER)!, {
      rules: { 'nested-interactive': { enabled: true } },
    })
    expect(results).toHaveNoViolations()
  })
})
