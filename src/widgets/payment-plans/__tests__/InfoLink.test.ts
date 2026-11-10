import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
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

  it('opens the modal when the info line is clicked', async () => {
    const user = userEvent.setup()
    await renderWithKnowMoreHint()

    expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument()

    await user.click(document.getElementById('payment-info-text')!)

    expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
  })

  it('opens the modal when the info line is activated with the keyboard', async () => {
    const user = userEvent.setup()
    await renderWithKnowMoreHint()

    const infoText = document.getElementById('payment-info-text')!
    infoText.focus()
    expect(infoText).toHaveFocus()

    await user.keyboard('{Enter}')

    expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
  })

  it('has no accessibility violations with the clickable info line', async () => {
    await renderWithKnowMoreHint()

    const results = await axe(document.querySelector(TEST_CONTAINER)!, {
      rules: { 'nested-interactive': { enabled: true } },
    })
    expect(results).toHaveNoViolations()
  })
})
