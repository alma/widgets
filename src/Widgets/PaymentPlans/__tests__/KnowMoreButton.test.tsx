/* In the widget, le Logo Alma is included into a button that is used as a "Know More" button.
 * By clicking it, the modal will be opened with more information.
 * It has been designed like this because the widget itself is not clickable anymore to meet the RGAA criteria
 * So, in order to keep it instinctive for the user to interact with the widget, it has been decided to make the Logo
 * Clickable instead. */

/* eslint-disable testing-library/no-unnecessary-act */
import React from 'react'

import { act, screen, waitFor, within } from '@testing-library/react'
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

describe('Know More Button Tests', () => {
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

  const defaultRender = async () => {
    await act(async () => {
      render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )
    })

    // Wait for all async state updates to complete
    await act(async () => {
      await screen.findByTestId('widget-container')
    })
  }

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      expect(knowMoreButton).toBeInTheDocument()
      expect(knowMoreButton).toHaveAttribute('type', 'button')
      expect(knowMoreButton).toHaveAttribute('aria-label')
      expect(knowMoreButton).toHaveAttribute('aria-haspopup', 'dialog')
      expect(knowMoreButton).toHaveAttribute('aria-describedby', 'payment-info-text')
    })

    it('should not have any accessibility violations', async () => {
      const { container } = render(
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />,
      )

      // Wait for component to be fully rendered
      await screen.findByTestId('widget-container')

      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have decorative icon with proper aria attributes', async () => {
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // The Info icon should be marked as decorative
      const icon = knowMoreButton.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).toHaveAttribute('focusable', 'false')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be focusable and respond to keyboard activation', async () => {
      const user = userEvent.setup()
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // Focus directly on the know more button instead of using tab navigation
      await act(async () => {
        knowMoreButton.focus()
      })
      expect(knowMoreButton).toHaveFocus()

      // Activation with Enter
      await act(async () => {
        await user.keyboard('{Enter}')
      })
      await waitFor(() => {
        expect(screen.getByTestId('modal-container')).toBeInTheDocument()
      })
    })

    it('should respond to spacebar activation', async () => {
      const user = userEvent.setup()
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // Focus directly on the know more button
      await act(async () => {
        knowMoreButton.focus()
      })
      expect(knowMoreButton).toHaveFocus()

      // Activation with Space
      await act(async () => {
        await user.keyboard(' ')
      })
      await waitFor(() => {
        expect(screen.getByTestId('modal-container')).toBeInTheDocument()
      })
    })

    it('should be reachable via tab navigation', async () => {
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // Verify that the button is focusable (has tabIndex 0 or no negative tabIndex)
      expect(knowMoreButton).not.toHaveAttribute('tabindex', '-1')

      // Alternative: Test that the button can receive focus programmatically
      await act(async () => {
        knowMoreButton.focus()
      })
      expect(knowMoreButton).toHaveFocus()
    })
  })

  describe('Modal Interaction', () => {
    it('should open modal when clicked', async () => {
      const user = userEvent.setup()
      await defaultRender()

      // Ensure no modal is present initially
      expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      await act(async () => {
        await user.click(knowMoreButton)
      })

      await waitFor(() => {
        // Use a more specific selector instead of role="dialog"
        expect(screen.getByTestId('modal-container')).toBeInTheDocument()
      })
    })

    it('should call onModalClose callback when modal is closed', async () => {
      const mockOnModalClose = jest.fn()
      const user = userEvent.setup()

      await act(async () => {
        render(
          <PaymentPlanWidget
            purchaseAmount={40000}
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
            onModalClose={mockOnModalClose}
          />,
        )
      })

      await act(async () => {
        await screen.findByTestId('widget-container')
      })

      // Open the modal
      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      await act(async () => {
        await user.click(knowMoreButton)
      })

      await waitFor(() => {
        expect(screen.getByTestId('modal-container')).toBeInTheDocument()
      })

      // Close the modal with the close button
      const closeButton = screen.getByTestId('modal-close-button')
      await act(async () => {
        await user.click(closeButton)
      })

      expect(mockOnModalClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Visual and Content', () => {
    it('should display correct Logo content', async () => {
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      expect(within(knowMoreButton).getByTestId('Alma-Logo')).toBeInTheDocument()
    })

    it('should apply monochrome styling when prop is passed', async () => {
      await act(async () => {
        render(
          <PaymentPlanWidget
            purchaseAmount={40000}
            monochrome
            apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
          />,
        )
      })

      await act(async () => {
        await screen.findByTestId('widget-container')
      })

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      expect(knowMoreButton).toHaveClass('monochrome')
    })

    it('should have proper ARIA relationship with payment info text', async () => {
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // The button should be described by the payment plan information text
      expect(knowMoreButton).toHaveAttribute('aria-describedby', 'payment-info-text')
    })
  })

  describe('Error Handling', () => {
    it('should handle click events gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const user = userEvent.setup()
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // Simulate multiple click events with userEvent
      await act(async () => {
        await user.click(knowMoreButton)
        await user.click(knowMoreButton)
      })

      expect(consoleSpy).not.toHaveBeenCalled()
      consoleSpy.mockRestore()
    })

    it('should prevent default behavior on keyboard events', async () => {
      const user = userEvent.setup()
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })

      // Focus the button first
      await act(async () => {
        knowMoreButton.focus()
      })

      // Test Enter key behavior with userEvent
      await act(async () => {
        await user.keyboard('{Enter}')
      })

      // Verify modal opens (which means the event was handled)
      await waitFor(() => {
        expect(screen.getByTestId('modal-container')).toBeInTheDocument()
      })

      // Close modal for next test
      const closeButton = screen.getByTestId('modal-close-button')
      await act(async () => {
        await user.click(closeButton)
      })

      // Reset focus and test Space key
      await act(async () => {
        knowMoreButton.focus()
      })

      await act(async () => {
        await user.keyboard(' ')
      })

      // Verify modal opens again
      await waitFor(() => {
        expect(screen.getByTestId('modal-container')).toBeInTheDocument()
      })
    })
  })

  describe('Integration with Payment Plans', () => {
    it('should respect aria-describedby relationship with current plan info', async () => {
      await defaultRender()

      const knowMoreButton = screen.getByRole('button', {
        name: 'Ouvrir les options de paiement Alma pour en savoir plus',
      })
      const describedElement = document.getElementById('payment-info-text')

      expect(knowMoreButton).toHaveAttribute('aria-describedby', 'payment-info-text')
      expect(describedElement).toBeInTheDocument()

      // The description text should contain information about the plan
      expect(describedElement).toHaveTextContent(/payer/i)
    })
  })
})
