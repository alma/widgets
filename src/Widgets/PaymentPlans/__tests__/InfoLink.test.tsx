/* eslint-disable testing-library/no-unnecessary-act */
import React from 'react'

import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import { ApiMode } from '@/consts'
import render from '@/test'
import { mockButtonPlans } from '@/test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

// Mock fetch to avoid real API calls during tests
jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

describe('Payment info line (know more link)', () => {
  beforeEach(() => {
    // Mock requestAnimationFrame to avoid timing issues with react-modal
    global.requestAnimationFrame = jest.fn((cb) => {
      setTimeout(cb, 0)
      return 0
    })
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const renderWithKnowMoreHint = async () => {
    await act(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          suggestedPaymentPlan={10}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
    })

    await act(async () => {
      await screen.findByTestId('widget-container')
    })
  }

  it('exposes the info line as an accessible button when the plan is eligible', async () => {
    await renderWithKnowMoreHint()

    const infoText = document.getElementById('payment-info-text')
    expect(infoText).toBeInTheDocument()
    expect(infoText).toHaveAttribute('role', 'button')
    expect(infoText).toHaveAttribute('tabindex', '0')
    expect(infoText).toHaveAttribute('aria-haspopup', 'dialog')
    expect(infoText).toHaveTextContent(/en savoir plus/i)
  })

  it('opens the modal when the info line is clicked', async () => {
    const user = userEvent.setup()
    await renderWithKnowMoreHint()

    expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument()

    const infoText = document.getElementById('payment-info-text') as HTMLElement
    await act(async () => {
      await user.click(infoText)
    })

    await waitFor(() => {
      expect(screen.getByTestId('modal-container')).toBeInTheDocument()
    })
  })

  it('opens the modal when the info line is activated with the keyboard', async () => {
    const user = userEvent.setup()
    await renderWithKnowMoreHint()

    const infoText = document.getElementById('payment-info-text') as HTMLElement
    await act(async () => {
      infoText.focus()
    })
    expect(infoText).toHaveFocus()

    await act(async () => {
      await user.keyboard('{Enter}')
    })
    await waitFor(() => {
      expect(screen.getByTestId('modal-container')).toBeInTheDocument()
    })
  })

  it('has no accessibility violations with the clickable info line', async () => {
    const { container } = render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        suggestedPaymentPlan={10}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
