import React from 'react'

import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { AlmaLogo } from '@/assets/almaLogo'
import AmexCard from '@/assets/cards/amex'
import CbCard from '@/assets/cards/cb'
import MastercardCard from '@/assets/cards/mastercard'
import VisaCard from '@/assets/cards/visa'
import CrossIcon from '@/assets/Cross'
import render from '@/test'

describe('Accessibility - SVG & Logos', () => {
  describe('AlmaLogo Accessibility Tests', () => {
    it('should always be decorative with proper aria-hidden', async () => {
      const { container } = render(<AlmaLogo />)

      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('aria-hidden', 'true')
      expect(logo).toHaveAttribute('focusable', 'false')
      expect(logo).not.toHaveAttribute('aria-label')
      expect(logo).not.toHaveAttribute('role')

      // Should not have accessibility violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should maintain visual styling with custom props', () => {
      const { container } = render(<AlmaLogo color="#ff0000" className="test-logo" />)

      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveClass('test-logo')

      const path = logo?.querySelector('path')
      expect(path).toBeInTheDocument()
      expect(path).toHaveAttribute('fill', '#ff0000')

      // Should still be decorative
      expect(logo).toHaveAttribute('aria-hidden', 'true')
    })

    it('should support additional SVG attributes', async () => {
      const { container } = render(<AlmaLogo data-testid="alma-logo" width="100" height="50" />)

      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('data-testid', 'alma-logo')
      expect(logo).toHaveAttribute('width', '100')
      expect(logo).toHaveAttribute('height', '50')

      // Should not have accessibility violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should properly handle focus management', () => {
      const { container } = render(<AlmaLogo />)

      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('focusable', 'false')

      // Logo should not be focusable via keyboard
      logo?.focus()
      expect(document.activeElement).not.toBe(logo)
    })

    it('should have correct default dimensions and viewBox', () => {
      const { container } = render(<AlmaLogo />)

      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('width', '42')
      expect(logo).toHaveAttribute('height', '24')
      expect(logo).toHaveAttribute('viewBox', '0 0 352 120')
      expect(logo).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    })

    it('should not contains any RGAA violation (contradictory aria attributes)', async () => {
      const { container } = render(<AlmaLogo />)

      const logo = container.querySelector('svg')
      expect(logo).toBeInTheDocument()

      // Should have aria-hidden but NOT aria-label when decorative
      expect(logo).toHaveAttribute('aria-hidden', 'true')
      expect(logo).not.toHaveAttribute('aria-label')
      expect(logo).not.toHaveAttribute('role')

      // Should not have accessibility violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })
  })

  describe('CrossIcon Accessibility Tests', () => {
    it('should always be decorative with proper aria-hidden', async () => {
      const { container } = render(<CrossIcon />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')
      expect(icon).toHaveAttribute('focusable', 'false')
      expect(icon).not.toHaveAttribute('aria-label')
      expect(icon).not.toHaveAttribute('role')

      // Should not have accessibility violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should maintain visual appearance with custom props', () => {
      const { container } = render(<CrossIcon color="#ff0000" className="test-class" />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveClass('test-class')

      const path = icon?.querySelector('path')
      expect(path).toBeInTheDocument()
      expect(path).toHaveAttribute('fill', '#ff0000')

      // Should still be decorative
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })

    it('should work correctly in button context (standard usage)', async () => {
      const { container } = render(
        <button type="button" aria-label="Close window">
          <CrossIcon />
        </button>,
      )

      const button = screen.getByRole('button', { name: 'Close window' })
      expect(button).toBeInTheDocument()

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('aria-hidden', 'true')

      // Should not have accessibility violations
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    it('should have correct dimensions and namespace', () => {
      const { container } = render(<CrossIcon />)

      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
      expect(icon).toHaveAttribute('width', '16')
      expect(icon).toHaveAttribute('height', '16')
      expect(icon).toHaveAttribute('viewBox', '0 0 16 16')
      expect(icon).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
    })
  })

  describe('Payment Cards Accessibility Tests', () => {
    describe('AmexCard', () => {
      it('should have proper accessibility attributes for informative icon', async () => {
        const { container } = render(<AmexCard />)

        const card = container.querySelector('svg')
        expect(card).toBeInTheDocument()
        expect(card).toHaveAttribute('aria-label', 'Carte American Express acceptée')
        expect(card).toHaveAttribute('role', 'img')
        expect(card).not.toHaveAttribute('aria-hidden')

        // Should not have accessibility violations
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('should be findable by screen readers with correct label', () => {
        render(<AmexCard />)

        const card = screen.getByLabelText('Carte American Express acceptée')
        expect(card).toBeInTheDocument()
      })

      it('should have correct dimensions and structure', () => {
        const { container } = render(<AmexCard />)

        const card = container.querySelector('svg')
        expect(card).toHaveAttribute('width', '24')
        expect(card).toHaveAttribute('height', '16')
        expect(card).toHaveAttribute('viewBox', '0 0 24 16')
        expect(card).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      })
    })

    describe('CbCard', () => {
      it('should have proper accessibility attributes for informative icon', async () => {
        const { container } = render(<CbCard />)

        const card = container.querySelector('svg')
        expect(card).toBeInTheDocument()
        expect(card).toHaveAttribute('aria-label', 'Carte Bancaire CB acceptée')
        expect(card).toHaveAttribute('role', 'img')
        expect(card).not.toHaveAttribute('aria-hidden')

        // Should not have accessibility violations
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('should be findable by screen readers with correct label', () => {
        render(<CbCard />)

        const card = screen.getByLabelText('Carte Bancaire CB acceptée')
        expect(card).toBeInTheDocument()
      })

      it('should have correct dimensions and structure', () => {
        const { container } = render(<CbCard />)

        const card = container.querySelector('svg')
        expect(card).toHaveAttribute('width', '24')
        expect(card).toHaveAttribute('height', '16')
        expect(card).toHaveAttribute('viewBox', '0 0 24 16')
        expect(card).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      })
    })

    describe('MastercardCard', () => {
      it('should have proper accessibility attributes for informative icon', async () => {
        const { container } = render(<MastercardCard />)

        const card = container.querySelector('svg')
        expect(card).toBeInTheDocument()
        expect(card).toHaveAttribute('aria-label', 'Carte Mastercard acceptée')
        expect(card).toHaveAttribute('role', 'img')
        expect(card).not.toHaveAttribute('aria-hidden')

        // Should not have accessibility violations
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('should be findable by screen readers with correct label', () => {
        render(<MastercardCard />)

        const card = screen.getByLabelText('Carte Mastercard acceptée')
        expect(card).toBeInTheDocument()
      })

      it('should have correct dimensions and structure', () => {
        const { container } = render(<MastercardCard />)

        const card = container.querySelector('svg')
        expect(card).toHaveAttribute('width', '24')
        expect(card).toHaveAttribute('height', '16')
        expect(card).toHaveAttribute('viewBox', '0 0 24 16')
        expect(card).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      })
    })

    describe('VisaCard', () => {
      it('should have proper accessibility attributes for informative icon', async () => {
        const { container } = render(<VisaCard />)

        const card = container.querySelector('svg')
        expect(card).toBeInTheDocument()
        expect(card).toHaveAttribute('aria-label', 'Carte Visa acceptée')
        expect(card).toHaveAttribute('role', 'img')
        expect(card).not.toHaveAttribute('aria-hidden')

        // Should not have accessibility violations
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('should be findable by screen readers with correct label', () => {
        render(<VisaCard />)

        const card = screen.getByLabelText('Carte Visa acceptée')
        expect(card).toBeInTheDocument()
      })

      it('should have correct dimensions and structure', () => {
        const { container } = render(<VisaCard />)

        const card = container.querySelector('svg')
        expect(card).toHaveAttribute('width', '24')
        expect(card).toHaveAttribute('height', '16')
        expect(card).toHaveAttribute('viewBox', '0 0 24 16')
        expect(card).toHaveAttribute('xmlns', 'http://www.w3.org/2000/svg')
      })
    })

    describe('Payment Cards Integration Tests', () => {
      it('should all cards be accessible when rendered together', async () => {
        const { container } = render(
          <div>
            <AmexCard />
            <CbCard />
            <MastercardCard />
            <VisaCard />
          </div>,
        )

        // All cards should be present and accessible
        expect(screen.getByLabelText('Carte American Express acceptée')).toBeInTheDocument()
        expect(screen.getByLabelText('Carte Bancaire CB acceptée')).toBeInTheDocument()
        expect(screen.getByLabelText('Carte Mastercard acceptée')).toBeInTheDocument()
        expect(screen.getByLabelText('Carte Visa acceptée')).toBeInTheDocument()

        // Should not have accessibility violations when all together
        const results = await axe(container)
        expect(results).toHaveNoViolations()
      })

      it('should provide meaningful information to screen reader users', () => {
        render(
          <div>
            <p>Cartes acceptées :</p>
            <AmexCard />
            <CbCard />
            <MastercardCard />
            <VisaCard />
          </div>,
        )

        // Screen reader should understand which payment methods are accepted
        const acceptedCards = screen.getAllByRole('img')
        expect(acceptedCards).toHaveLength(4)

        // Each card should have a descriptive label indicating it's accepted
        acceptedCards.forEach((card) => {
          expect(card.getAttribute('aria-label')).toMatch(/acceptée$/)
        })
      })
    })
  })
})
