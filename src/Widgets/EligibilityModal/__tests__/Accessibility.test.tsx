/* eslint-disable jest/no-conditional-expect */
/* eslint-disable testing-library/no-unnecessary-act */
import React, { act } from 'react'

import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { axe } from 'jest-axe'

import render from '@/test'
import { statusResponse } from '@/types'
import { mockPlansAllEligible } from 'test/fixtures'
import EligibilityModal from 'Widgets/EligibilityModal'

describe('EligibilityModal Accessibility Tests', () => {
  const onCloseMock = jest.fn()

  beforeEach(() => {
    // Mock requestAnimationFrame to avoid timing issues in tests
    global.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 0))
    global.cancelAnimationFrame = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should not have any accessibility violations when open', async () => {
    const { container } = render(
      <EligibilityModal
        onClose={onCloseMock}
        eligibilityPlans={mockPlansAllEligible}
        status={statusResponse.SUCCESS}
      />,
    )

    // Wait for content to load and modal to stabilize
    await screen.findByTestId('modal-close-button')
    await waitFor(() => {
      expect(screen.getByTestId('modal-close-button')).toBeInTheDocument()
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper modal semantics', async () => {
    const { container } = render(
      <EligibilityModal
        onClose={onCloseMock}
        eligibilityPlans={mockPlansAllEligible}
        status={statusResponse.SUCCESS}
      />,
    )

    await screen.findByTestId('modal-close-button')

    // Check close button (confirms modal is open)
    const closeButton = screen.getByTestId('modal-close-button')
    expect(closeButton).toBeInTheDocument()
    expect(closeButton).toHaveAttribute('aria-label')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have accessible plan selection', async () => {
    const { container } = render(
      <EligibilityModal
        onClose={onCloseMock}
        eligibilityPlans={mockPlansAllEligible}
        status={statusResponse.SUCCESS}
      />,
    )

    await screen.findByTestId('modal-close-button')

    // Check that plans are accessible
    const planButtons = container.querySelectorAll('button[data-testid*="plan-button"]')
    planButtons.forEach((button) => {
      expect(button).toHaveAttribute('aria-label')
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle keyboard navigation properly', async () => {
    const { container } = render(
      <EligibilityModal
        onClose={onCloseMock}
        eligibilityPlans={mockPlansAllEligible}
        status={statusResponse.SUCCESS}
      />,
    )

    await screen.findByTestId('modal-close-button')

    // Check that all interactive elements are keyboard accessible
    const interactiveElements = container.querySelectorAll('button, a, [tabindex]')

    // Avoid conditional expects
    const invalidTabIndexElements = Array.from(interactiveElements).filter((element) => {
      const tabIndex = element.getAttribute('tabindex')
      if (tabIndex !== null) {
        const tabIndexValue = parseInt(tabIndex, 10)
        return tabIndexValue < -1
      }
      return false
    })

    expect(invalidTabIndexElements).toHaveLength(0)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should work with initial plan index', async () => {
    const { container } = render(
      <EligibilityModal
        onClose={onCloseMock}
        eligibilityPlans={mockPlansAllEligible}
        status={statusResponse.SUCCESS}
        initialPlanIndex={1}
      />,
    )

    await screen.findByTestId('modal-close-button')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  describe('EligibilityPlansButtons component', () => {
    describe('accessibility features', () => {
      const setup = async () => {
        render(
          <EligibilityModal
            eligibilityPlans={mockPlansAllEligible}
            status={statusResponse.SUCCESS}
            onClose={() => jest.fn()}
            initialPlanIndex={0}
          />,
        )
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

        // Click on 2x plan - wrap in act to handle state updates
        // eslint-disable-next-line testing-library/no-unnecessary-act
        await act(async () => {
          await userEvent.click(twoTimesButton)
        })

        // Check updated state
        expect(payNowButton).toHaveAttribute('aria-pressed', 'false')
        expect(twoTimesButton).toHaveAttribute('aria-pressed', 'true')
        expect(twoTimesButton).toHaveAttribute('aria-current', 'true')
      })
    })

    describe('keyboard navigation', () => {
      const setup = async () => {
        render(
          <EligibilityModal
            eligibilityPlans={mockPlansAllEligible}
            status={statusResponse.SUCCESS}
            onClose={() => jest.fn()}
            initialPlanIndex={1} // Start with M+1 plan
          />,
        )
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
        await act(async () => {
          await userEvent.keyboard('{ArrowLeft}')
        })

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
        await act(async () => {
          await userEvent.keyboard('{ArrowRight}')
        })

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
        await act(async () => {
          await userEvent.keyboard('{Home}')
        })

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
        await act(async () => {
          await userEvent.keyboard('{End}')
        })

        // Check that last plan is now selected
        expect(lastButton).toHaveAttribute('aria-pressed', 'true')
        expect(currentButton).toHaveAttribute('aria-pressed', 'false')
      })

      it('should not navigate beyond first plan with ArrowLeft', async () => {
        const firstButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement Payer maintenant/,
        })

        // Click to select first plan, then try to go left
        await act(async () => {
          await userEvent.click(firstButton)
        })
        firstButton.focus()
        await act(async () => {
          await userEvent.keyboard('{ArrowLeft}')
        })

        // Should still be on first plan
        expect(firstButton).toHaveAttribute('aria-pressed', 'true')
      })

      it('should not navigate beyond last plan with ArrowRight', async () => {
        const lastButton = screen.getByRole('button', {
          name: /Sélectionner le plan de paiement 10x/,
        })

        // Click to select last plan, then try to go right
        await act(async () => {
          await userEvent.click(lastButton)
        })
        lastButton.focus()
        await act(async () => {
          await userEvent.keyboard('{ArrowRight}')
        })

        // Should still be on last plan
        expect(lastButton).toHaveAttribute('aria-pressed', 'true')
      })
    })

    describe('button interactions', () => {
      const setup = async () => {
        render(
          <EligibilityModal
            eligibilityPlans={mockPlansAllEligible}
            status={statusResponse.SUCCESS}
            onClose={() => jest.fn()}
            initialPlanIndex={0}
          />,
        )
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
        await act(async () => {
          await userEvent.click(
            screen.getByRole('button', { name: /Sélectionner le plan de paiement 3x/ }),
          )
        })

        const installmentElement = screen.getByTestId('modal-installments-element')
        expect(installmentElement).toHaveTextContent("Aujourd'hui")
        expect(installmentElement).toHaveTextContent('150,00 €')

        // Test clicking on M+1 plan
        await act(async () => {
          await userEvent.click(
            screen.getByRole('button', { name: /Sélectionner le plan de paiement M\+1/ }),
          )
        })
        expect(installmentElement).toHaveTextContent('450,00 €')
        expect(installmentElement).toHaveTextContent(/1 janvier 2022/)
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
        await act(async () => {
          await userEvent.click(twoTimesButton)
        })

        // Check updated classes
        expect(payNowButton).not.toHaveClass('active')
        expect(twoTimesButton).toHaveClass('active')
      })
    })

    describe('plan button labels', () => {
      it('should display correct shorthand names for different plan types', async () => {
        render(
          <EligibilityModal
            eligibilityPlans={mockPlansAllEligible}
            status={statusResponse.SUCCESS}
            onClose={() => jest.fn()}
            initialPlanIndex={0}
          />,
        )
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
        render(
          <EligibilityModal
            eligibilityPlans={mockPlansAllEligible}
            status={statusResponse.SUCCESS}
            onClose={() => jest.fn()}
            initialPlanIndex={0}
          />,
        )
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
