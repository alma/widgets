/* The logo is the "know more" button: the widget isn't clickable (RGAA). */
import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'

import type { PaymentPlanWidgetOptions } from '@/public-api/public-api.types'
import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget, TEST_CONTAINER } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const KNOW_MORE_NAME = 'Ouvrir les options de paiement Alma pour en savoir plus'

const defaultRender = async (options: Partial<PaymentPlanWidgetOptions> = {}) => {
  await mountWidget('PaymentPlans', { purchaseAmount: 40000, ...options })
  await screen.findByTestId('widget-container')
}

const getKnowMoreButton = () => screen.getByRole('button', { name: KNOW_MORE_NAME })

describe('Know More Button Tests', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  describe('Accessibility', () => {
    it('should have proper accessibility attributes', async () => {
      await defaultRender()

      const knowMoreButton = getKnowMoreButton()

      expect(knowMoreButton).toHaveAttribute('type', 'button')
      expect(knowMoreButton).toHaveAttribute('aria-label')
      expect(knowMoreButton).toHaveAttribute('aria-haspopup', 'dialog')
      expect(knowMoreButton).toHaveAttribute('aria-describedby', 'payment-info-text')
    })

    it('should not have any accessibility violations', async () => {
      await defaultRender()

      expect(await axe(document.querySelector(TEST_CONTAINER)!)).toHaveNoViolations()
    })

    it('should have decorative icon with proper aria attributes', async () => {
      await defaultRender()

      const icon = getKnowMoreButton().querySelector('svg')
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).toHaveAttribute('focusable', 'false')
    })
  })

  describe('Keyboard Navigation', () => {
    it('should be focusable and respond to keyboard activation', async () => {
      const user = userEvent.setup()
      await defaultRender()

      getKnowMoreButton().focus()
      expect(getKnowMoreButton()).toHaveFocus()

      await user.keyboard('{Enter}')

      expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
    })

    it('should respond to spacebar activation', async () => {
      const user = userEvent.setup()
      await defaultRender()

      getKnowMoreButton().focus()
      expect(getKnowMoreButton()).toHaveFocus()

      await user.keyboard(' ')

      expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
    })

    it('should be reachable via tab navigation', async () => {
      await defaultRender()

      const knowMoreButton = getKnowMoreButton()
      expect(knowMoreButton).not.toHaveAttribute('tabindex', '-1')

      knowMoreButton.focus()
      expect(knowMoreButton).toHaveFocus()
    })
  })

  describe('Modal Interaction', () => {
    it('should open modal when clicked', async () => {
      const user = userEvent.setup()
      await defaultRender()

      expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument()

      await user.click(getKnowMoreButton())

      expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
    })

    it('should call onModalClose callback when modal is closed', async () => {
      const onModalClose = vi.fn()
      const user = userEvent.setup()
      await defaultRender({ onModalClose })

      await user.click(getKnowMoreButton())
      await screen.findByTestId('modal-container')

      await user.click(screen.getByTestId('modal-close-button'))

      expect(onModalClose).toHaveBeenCalledTimes(1)
    })
  })

  describe('Visual and Content', () => {
    it('should display correct Logo content', async () => {
      await defaultRender()

      expect(within(getKnowMoreButton()).getByTestId('Alma-Logo')).toBeInTheDocument()
    })

    it('should apply monochrome styling when prop is passed', async () => {
      await defaultRender({ monochrome: true })

      expect(getKnowMoreButton()).toHaveClass('monochrome')
    })

    it('should have proper ARIA relationship with payment info text', async () => {
      await defaultRender()

      expect(getKnowMoreButton()).toHaveAttribute('aria-describedby', 'payment-info-text')
    })
  })

  describe('Error Handling', () => {
    it('should handle click events gracefully', async () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      const user = userEvent.setup()
      await defaultRender()

      await user.click(getKnowMoreButton())
      await user.click(getKnowMoreButton())

      expect(consoleError).not.toHaveBeenCalled()
    })

    it('should prevent default behavior on keyboard events', async () => {
      const user = userEvent.setup()
      await defaultRender()

      getKnowMoreButton().focus()
      await user.keyboard('{Enter}')
      await screen.findByTestId('modal-container')

      await user.click(screen.getByTestId('modal-close-button'))
      await vi.waitFor(() =>
        expect(screen.queryByTestId('modal-container')).not.toBeInTheDocument(),
      )

      getKnowMoreButton().focus()
      await user.keyboard(' ')

      expect(await screen.findByTestId('modal-container')).toBeInTheDocument()
    })
  })

  describe('Integration with Payment Plans', () => {
    it('should respect aria-describedby relationship with current plan info', async () => {
      await defaultRender()

      const describedElement = document.getElementById('payment-info-text')

      expect(getKnowMoreButton()).toHaveAttribute('aria-describedby', 'payment-info-text')
      expect(describedElement).toBeInTheDocument()
      expect(describedElement?.textContent).toMatch(/payer/i)
    })
  })
})
