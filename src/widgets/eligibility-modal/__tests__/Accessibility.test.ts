import { screen, waitFor } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { configureAxe } from 'vitest-axe'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { configPlans, mockPlansAllEligible } from '@/test/fixtures'
import { mountWidget } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

// Master labels two regions with payment-schedule-title: EligibilityModal's scheduleArea div and
// the Schedule region inside it.
const axe = configureAxe({ rules: { 'landmark-unique': { enabled: false } } })

// Master runs axe on its render container, which stays empty because react-modal renders in <body>.
const modalPortal = (): HTMLElement => {
  const portal = document.querySelector<HTMLElement>('.ReactModalPortal')
  if (!portal) throw new Error('The modal is not open')
  return portal
}

// Master passes initialPlanIndex, which add(Modal) doesn't take: a click on that plan stands for it.
// The merchant plans keep pay-now.
const renderEligibilityModal = async ({
  onClose = vi.fn(),
  initialPlanIndex = 0,
}: { onClose?: () => void; initialPlanIndex?: number } = {}) => {
  server.use(eligibilityPlans(mockPlansAllEligible))
  const { handle } = await mountWidget('Modal', {
    clickableSelector: '',
    purchaseAmount: 45000,
    plans: configPlans,
    onClose,
  })
  handle?.open()
  await vi.waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument())
  if (initialPlanIndex > 0) {
    const planButtons = document.querySelectorAll<HTMLElement>('#payment-plans button')
    await userEvent.click(planButtons[initialPlanIndex])
  }
}

describe('EligibilityModal Accessibility Tests', () => {
  const onCloseMock = vi.fn()

  it('should not have any accessibility violations when open', async () => {
    await renderEligibilityModal({ onClose: onCloseMock })

    // Wait for content to load and modal to stabilize
    await screen.findByTestId('modal-close-button')
    await waitFor(() => {
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    })

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should have proper modal semantics', async () => {
    await renderEligibilityModal({ onClose: onCloseMock })

    await screen.findByTestId('modal-close-button')

    // Check close button (confirms modal is open)
    const closeButton = screen.getByTestId('modal-close-button')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveAttribute('aria-label')

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should have accessible plan selection', async () => {
    await renderEligibilityModal({ onClose: onCloseMock })

    await screen.findByTestId('modal-close-button')

    // Master's query, kept as it is: no plan button has a data-testid, so it matches nothing.
    const planButtons = modalPortal().querySelectorAll('button[data-testid*="plan-button"]')
    planButtons.forEach((button) => {
      expect(button).toHaveAttribute('aria-label')
    })

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should handle keyboard navigation properly', async () => {
    await renderEligibilityModal({ onClose: onCloseMock })

    await screen.findByTestId('modal-close-button')

    // Check that all interactive elements are keyboard accessible
    const interactiveElements = modalPortal().querySelectorAll('button, a, [tabindex]')

    const invalidTabIndexElements = Array.from(interactiveElements).filter((element) => {
      const tabIndex = element.getAttribute('tabindex')
      if (tabIndex !== null) {
        const tabIndexValue = parseInt(tabIndex, 10)
        return tabIndexValue < -1
      }
      return false
    })

    expect(invalidTabIndexElements).toHaveLength(0)

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  it('should work with initial plan index', async () => {
    await renderEligibilityModal({ onClose: onCloseMock, initialPlanIndex: 1 })

    await screen.findByTestId('modal-close-button')

    const results = await axe(modalPortal())
    expect(results).toHaveNoViolations()
  })

  describe('EligibilityPlansButtons component', () => {
    describe('accessibility features', () => {
      const setup = async () => {
        await renderEligibilityModal({ initialPlanIndex: 0 })
        await screen.findByTestId('modal-close-button')
      }

      beforeEach(async () => {
        await setup()
      })

      it('should have proper ARIA attributes for the current plan', () => {
        // Use the parent button containing the text rather than the span
        const activeButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })
        expect(activeButton).toHaveAttribute('aria-pressed', 'true')
        expect(activeButton).toHaveAttribute('aria-current', 'true')
        expect(activeButton).toHaveAttribute(
          'aria-label',
          'Sélectionner le plan de paiement Payer maintenant',
        )
      })

      it('should have proper ARIA attributes for inactive plans', () => {
        // Use the parent button containing the text rather than the span
        const inactiveButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 2x/,
        })
        expect(inactiveButton).toHaveAttribute('aria-pressed', 'false')
        expect(inactiveButton).not.toHaveAttribute('aria-current')
        expect(inactiveButton).toHaveAttribute('aria-label', 'Sélectionner le plan de paiement 2x')
      })

      it('should have a group role with proper labeling', () => {
        const group = screen.getByRole('group')
        expect(group).toHaveAttribute('aria-labelledby', 'payment-plans-title')
        expect(screen.getByText('Options de paiement disponibles')).toBeInTheDocument()
      })

      it('should update ARIA attributes when plan selection changes', async () => {
        const payNowButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })
        const twoTimesButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 2x/,
        })

        // Initial state
        expect(payNowButton).toHaveAttribute('aria-pressed', 'true')
        expect(twoTimesButton).toHaveAttribute('aria-pressed', 'false')

        await userEvent.click(twoTimesButton)

        // Check updated state
        expect(payNowButton).toHaveAttribute('aria-pressed', 'false')
        expect(twoTimesButton).toHaveAttribute('aria-pressed', 'true')
        expect(twoTimesButton).toHaveAttribute('aria-current', 'true')
      })
    })

    describe('keyboard navigation', () => {
      const setup = async () => {
        // Start with M+1 plan
        await renderEligibilityModal({ initialPlanIndex: 1 })
        await screen.findByTestId('modal-close-button')
      }

      beforeEach(async () => {
        await setup()
      })

      it('should navigate to previous plan with ArrowLeft key', async () => {
        const currentButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement M\+1/,
        })
        const previousButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })

        // Focus on current button and press ArrowLeft
        currentButton.focus()
        await userEvent.keyboard('{ArrowLeft}')

        // Check that previous plan is now selected
        expect(previousButton).toHaveAttribute('aria-pressed', 'true')
        expect(currentButton).toHaveAttribute('aria-pressed', 'false')
      })

      it('should navigate to next plan with ArrowRight key', async () => {
        const currentButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement M\+1/,
        })
        const nextButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 2x/,
        })

        // Focus on current button and press ArrowRight
        currentButton.focus()
        await userEvent.keyboard('{ArrowRight}')

        // Check that next plan is now selected
        expect(nextButton).toHaveAttribute('aria-pressed', 'true')
        expect(currentButton).toHaveAttribute('aria-pressed', 'false')
      })

      it('should navigate to first plan with Home key', async () => {
        const currentButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement M\+1/,
        })
        const firstButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })

        // Focus on current button and press Home
        currentButton.focus()
        await userEvent.keyboard('{Home}')

        // Check that first plan is now selected
        expect(firstButton).toHaveAttribute('aria-pressed', 'true')
        expect(currentButton).toHaveAttribute('aria-pressed', 'false')
      })

      it('should navigate to last plan with End key', async () => {
        const currentButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement M\+1/,
        })
        const lastButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 10x/,
        })

        // Focus on current button and press End
        currentButton.focus()
        await userEvent.keyboard('{End}')

        // Check that last plan is now selected
        expect(lastButton).toHaveAttribute('aria-pressed', 'true')
        expect(currentButton).toHaveAttribute('aria-pressed', 'false')
      })

      it('should not navigate beyond first plan with ArrowLeft', async () => {
        const firstButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })

        // Click to select first plan, then try to go left
        await userEvent.click(firstButton)
        firstButton.focus()
        await userEvent.keyboard('{ArrowLeft}')

        // Should still be on first plan
        expect(firstButton).toHaveAttribute('aria-pressed', 'true')
      })

      it('should not navigate beyond last plan with ArrowRight', async () => {
        const lastButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 10x/,
        })

        // Click to select last plan, then try to go right
        await userEvent.click(lastButton)
        lastButton.focus()
        await userEvent.keyboard('{ArrowRight}')

        // Should still be on last plan
        expect(lastButton).toHaveAttribute('aria-pressed', 'true')
      })
    })

    describe('button interactions', () => {
      const setup = async () => {
        await renderEligibilityModal({ initialPlanIndex: 0 })
        await screen.findByTestId('modal-close-button')
      }

      beforeEach(async () => {
        await setup()
      })

      it('should have correct button types', () => {
        const buttons = screen
          .getAllByRole('button')
          .filter((button) =>
            ['Payer maintenant', 'M+1', '2x', '3x', '4x', '10x'].includes(button.textContent || ''),
          )

        buttons.forEach((button) => {
          expect(button).toHaveAttribute('type', 'button')
        })
      })

      it('should update payment details when clicking different plans', async () => {
        // Test clicking on 3x plan
        await userEvent.click(
          screen.getByRole('button', { name: /Sélectionner le plan de paiement 3x/ }),
        )

        const installmentElement = screen.getByTestId('modal-installments-element')
        expect(installmentElement).toHaveTextContent("Aujourd'hui")
        expect(installmentElement).toHaveTextContent('150,00 €')

        // Test clicking on M+1 plan
        await userEvent.click(
          screen.getByRole('button', { name: /Sélectionner le plan de paiement M\+1/ }),
        )
        expect(installmentElement).toHaveTextContent('450,00 €')
        // Master's /1 janvier 2022/. The matcher types here take no RegExp, and a string also
        // matches a part of the text.
        expect(installmentElement).toHaveTextContent('1 janvier 2022')
      })

      it('should apply active CSS class to selected plan', async () => {
        const payNowButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })
        const twoTimesButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 2x/,
        })

        // Initial state - pay now should be active
        expect(payNowButton).toHaveClass('active')
        expect(twoTimesButton).not.toHaveClass('active')

        // Click on 2x plan
        await userEvent.click(twoTimesButton)

        // Check updated classes
        expect(payNowButton).not.toHaveClass('active')
        expect(twoTimesButton).toHaveClass('active')
      })
    })

    describe('plan button labels', () => {
      it('should display correct shorthand names for different plan types', async () => {
        await renderEligibilityModal({ initialPlanIndex: 0 })
        await screen.findByTestId('modal-close-button')

        // Check that all expected plan names are displayed
        expect(screen.getByText('Payer maintenant')).toBeInTheDocument()
        expect(screen.getByText('M+1')).toBeInTheDocument()
        expect(screen.getByText('2x')).toBeInTheDocument()
        expect(screen.getByText('3x')).toBeInTheDocument()
        expect(screen.getByText('4x')).toBeInTheDocument()
        expect(screen.getByText('10x')).toBeInTheDocument()
      })

      it('should have unique keys for each plan button', async () => {
        await renderEligibilityModal({ initialPlanIndex: 0 })
        await screen.findByTestId('modal-close-button')

        // Each button should be rendered (no duplicate key warnings)
        const planButtons = screen
          .getAllByRole('button')
          .filter((button) =>
            ['Payer maintenant', 'M+1', '2x', '3x', '4x', '10x'].includes(button.textContent || ''),
          )

        expect(planButtons).toHaveLength(6)
      })
    })
  })
})
