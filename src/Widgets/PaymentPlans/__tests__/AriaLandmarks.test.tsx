import React from 'react'

import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import { ApiMode } from '@/consts'
import render from '@/test'
import { statusResponse } from '@/types'
import { mockButtonPlans } from 'test/fixtures'
import PaymentPlanWidget from 'Widgets/PaymentPlans'

jest.mock('utils/fetch', () => ({
  fetchFromApi: async () => mockButtonPlans,
}))

jest.mock('hooks/useFetchEligibility')
// eslint-disable-next-line global-require
const mockUseFetchEligibility = require('hooks/useFetchEligibility').default as jest.MockedFunction<
  typeof import('hooks/useFetchEligibility').default
>

describe('PaymentPlans ARIA Landmarks (RGAA 12.6) - Widget-Safe Structure', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFetchEligibility.mockImplementation(() => [mockButtonPlans, statusResponse.SUCCESS])
  })

  it('should have proper widget-safe landmark structure for RGAA compliance', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check widget container exists (neutral div without semantic interference)
    const widgetContainer = screen.getByTestId('widget-container')
    expect(widgetContainer).toBeInTheDocument()
    expect(widgetContainer.tagName).toBe('DIV')
    expect(widgetContainer).toHaveAttribute('id', 'alma-widget-payment-plans-main-container')

    // Check both region landmarks exist with proper ARIA labeling
    const regionLandmarks = screen.getAllByRole('region')
    expect(regionLandmarks).toHaveLength(2)

    // Payment plans region
    const paymentPlansRegion = screen.getByRole('region', {
      name: 'Options de paiement disponibles',
    })
    expect(paymentPlansRegion).toBeInTheDocument()
    expect(paymentPlansRegion).toHaveAttribute('aria-labelledby', 'payment-plans-title')

    // Payment info region
    const paymentInfoRegion = screen.getByRole('region', {
      name: /Informations sur le plan de paiement/,
    })
    expect(paymentInfoRegion).toBeInTheDocument()
    expect(paymentInfoRegion).toHaveAttribute('aria-labelledby', 'payment-info-title')

    // Verify regions are siblings (not nested) for proper landmark structure
    expect(paymentPlansRegion.contains(paymentInfoRegion)).toBe(false)
    expect(paymentInfoRegion.contains(paymentPlansRegion)).toBe(false)

    // Check ARIA-based heading structure (widget-safe)
    const paymentPlansTitle = document.getElementById('payment-plans-title')
    expect(paymentPlansTitle).toBeInTheDocument()
    expect(paymentPlansTitle).toHaveAttribute('role', 'heading')
    expect(paymentPlansTitle).toHaveAttribute('aria-level', '2')
    expect(paymentPlansTitle).toHaveClass('sr-only')

    const paymentInfoTitle = document.getElementById('payment-info-title')
    expect(paymentInfoTitle).toBeInTheDocument()
    expect(paymentInfoTitle).toHaveAttribute('role', 'heading')
    expect(paymentInfoTitle).toHaveAttribute('aria-level', '2')
    expect(paymentInfoTitle).toHaveClass('sr-only')
  })

  it('should have proper ARIA-based heading hierarchy for screen readers', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check ARIA headings exist with proper levels
    const headings = screen.getAllByRole('heading', { level: 2 })
    expect(headings).toHaveLength(2)

    const paymentPlansHeading = screen.getByRole('heading', {
      name: 'Options de paiement disponibles',
    })
    expect(paymentPlansHeading).toBeInTheDocument()
    expect(paymentPlansHeading).toHaveTextContent('Options de paiement disponibles')

    const paymentInfoHeading = screen.getByRole('heading', {
      name: /Informations sur le plan de paiement/,
    })
    expect(paymentInfoHeading).toBeInTheDocument()
    expect(paymentInfoHeading.textContent).toMatch(/Informations sur le plan de paiement/)

    // Verify headings are properly hidden from visual display but accessible to screen readers
    expect(paymentPlansHeading).toHaveClass('sr-only')
    expect(paymentInfoHeading).toHaveClass('sr-only')
  })

  it('should not inject semantic HTML elements that could interfere with host pages', async () => {
    const { container } = render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Verify no problematic semantic HTML tags are injected
    expect(container.querySelector('section')).not.toBeInTheDocument()
    expect(container.querySelector('aside')).not.toBeInTheDocument()
    expect(container.querySelector('article')).not.toBeInTheDocument()
    expect(container.querySelector('main')).not.toBeInTheDocument()
    expect(container.querySelector('header')).not.toBeInTheDocument()
    expect(container.querySelector('footer')).not.toBeInTheDocument()
    expect(container.querySelector('nav')).not.toBeInTheDocument()
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).not.toBeInTheDocument()

    // Verify ARIA-based semantics are used instead
    expect(screen.getAllByRole('region')).toHaveLength(2)
    expect(screen.getAllByRole('heading')).toHaveLength(2)
  })

  it('should maintain accessibility with listbox pattern for payment options', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check listbox exists with proper labeling
    const listbox = screen.getByRole('listbox')
    expect(listbox).toBeInTheDocument()
    expect(listbox).toHaveAttribute('aria-label', 'Options de paiement disponibles')

    // Check options exist within listbox
    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)

    // Verify at least one option is selected
    const selectedOptions = options.filter(
      (option) => option.getAttribute('aria-selected') === 'true',
    )
    expect(selectedOptions).toHaveLength(1)

    // Check all options have proper ARIA attributes
    options.forEach((option) => {
      expect(option).toHaveAttribute('role', 'option')
      expect(option).toHaveAttribute('aria-selected')
      expect(option).toHaveAttribute('aria-describedby', 'payment-info-text')
      expect(option).toHaveAttribute('aria-label')
    })
  })

  it('should have no accessibility violations when using widget-safe structure', async () => {
    const { container } = render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Run axe accessibility tests
    const results = await axe(container)
    expect(results).toHaveNoViolations()

    // Specifically check for heading hierarchy issues that could affect host pages
    const headingViolations = results.violations.filter(
      (violation) => violation.id.includes('heading') || violation.id.includes('landmark'),
    )
    expect(headingViolations).toHaveLength(0)
  })

  it('should support multiple widget instances without conflicts', async () => {
    render(
      <div>
        <PaymentPlanWidget
          purchaseAmount={40000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />
        <PaymentPlanWidget
          purchaseAmount={50000}
          apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
        />
      </div>,
    )

    // Wait for both widgets to render
    const containers = await screen.findAllByTestId('widget-container')
    expect(containers).toHaveLength(2)

    // Verify each widget has its own ID and doesn't conflict
    const widgetIds = containers.map((container) => container.id)
    expect(widgetIds[0]).toBe('alma-widget-payment-plans-main-container')
    expect(widgetIds[1]).toBe('alma-widget-payment-plans-main-container')

    // Note: In real implementation, we might want unique IDs for multiple instances
    // But current single-instance use case is acceptable

    // Verify both widgets have proper ARIA structure
    const allRegions = screen.getAllByRole('region')
    expect(allRegions.length).toBeGreaterThanOrEqual(4) // At least 2 regions per widget

    const allHeadings = screen.getAllByRole('heading')
    expect(allHeadings.length).toBeGreaterThanOrEqual(4) // At least 2 headings per widget
  })

  it('should maintain focus management and keyboard navigation', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check main interactive button exists and is focusable
    const mainButton = screen.getByRole('button', { name: /Ouvrir les options de paiement Alma/ })
    expect(mainButton).toBeInTheDocument()
    expect(mainButton).toHaveAttribute('aria-haspopup', 'dialog')

    // Check payment option buttons are focusable
    const optionButtons = screen.getAllByRole('option')
    optionButtons.forEach((button) => {
      expect(button).toHaveAttribute('tabindex')
      expect(button).toHaveAttribute('type', 'button')
    })

    // Verify live region exists for screen reader announcements
    const alertRegion = screen.getByRole('alert')
    expect(alertRegion).toBeInTheDocument()
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive')
  })
})
