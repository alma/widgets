import { screen, waitFor } from '@testing-library/dom'
import { axe } from 'vitest-axe'

import { eligibilityPlans } from '@/test/eligibilityHandlers'
import { mockButtonPlans } from '@/test/fixtures'
import { mountWidget, TEST_CONTAINER } from '@/test/mount-widget'
import { server } from '@/test/msw-server'

const defaultRender = async () => {
  await mountWidget('PaymentPlans', { purchaseAmount: 40000 })
  await screen.findByTestId('widget-container')
}

const addContainer = (id: string) => {
  const container = document.createElement('div')
  container.id = id
  document.body.append(container)
  return `#${id}`
}

describe('PaymentPlans ARIA Landmarks (RGAA 12.6) - Widget-Safe Structure', () => {
  beforeEach(() => {
    server.use(eligibilityPlans(mockButtonPlans))
  })

  it('should have proper widget-safe landmark structure for RGAA compliance', async () => {
    await defaultRender()

    const widgetContainer = screen.getByTestId('widget-container')
    expect(widgetContainer.tagName).toBe('DIV')
    expect(widgetContainer).toHaveAttribute('id', 'alma-widget-payment-plans-main-container')

    const regionLandmarks = screen.getAllByRole('region')
    expect(regionLandmarks).toHaveLength(2)

    const paymentPlansRegion = screen.getByRole('region', {
      name: 'Options de paiement disponibles',
    })
    expect(paymentPlansRegion).toHaveAttribute('aria-labelledby', 'payment-plans-title')

    const paymentInfoRegion = screen.getByRole('region', {
      name: /Informations sur le plan de paiement/,
    })
    expect(paymentInfoRegion).toHaveAttribute('aria-labelledby', 'payment-info-title')

    expect(paymentPlansRegion.contains(paymentInfoRegion)).toBe(false)
    expect(paymentInfoRegion.contains(paymentPlansRegion)).toBe(false)

    const paymentPlansTitle = document.getElementById('payment-plans-title')
    expect(paymentPlansTitle).toHaveAttribute('role', 'heading')
    expect(paymentPlansTitle).toHaveAttribute('aria-level', '2')
    expect(paymentPlansTitle).toHaveClass('sr-only')

    const paymentInfoTitle = document.getElementById('payment-info-title')
    expect(paymentInfoTitle).toHaveAttribute('role', 'heading')
    expect(paymentInfoTitle).toHaveAttribute('aria-level', '2')
    expect(paymentInfoTitle).toHaveClass('sr-only')
  })

  it('should have proper ARIA-based heading hierarchy for screen readers', async () => {
    await defaultRender()

    expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(2)

    const paymentPlansHeading = screen.getByRole('heading', {
      name: 'Options de paiement disponibles',
    })
    expect(paymentPlansHeading).toHaveTextContent('Options de paiement disponibles')

    const paymentInfoHeading = screen.getByRole('heading', {
      name: /Informations sur le plan de paiement/,
    })
    expect(paymentInfoHeading.textContent).toMatch(/Informations sur le plan de paiement/)

    expect(paymentPlansHeading).toHaveClass('sr-only')
    expect(paymentInfoHeading).toHaveClass('sr-only')
  })

  it('should not inject semantic HTML elements that could interfere with host pages', async () => {
    await defaultRender()
    const container = document.querySelector(TEST_CONTAINER)!

    expect(container.querySelector('section')).not.toBeInTheDocument()
    expect(container.querySelector('aside')).not.toBeInTheDocument()
    expect(container.querySelector('article')).not.toBeInTheDocument()
    expect(container.querySelector('main')).not.toBeInTheDocument()
    expect(container.querySelector('header')).not.toBeInTheDocument()
    expect(container.querySelector('footer')).not.toBeInTheDocument()
    expect(container.querySelector('nav')).not.toBeInTheDocument()
    expect(container.querySelector('h1, h2, h3, h4, h5, h6')).not.toBeInTheDocument()

    expect(screen.getAllByRole('region')).toHaveLength(2)
    expect(screen.getAllByRole('heading')).toHaveLength(2)
  })

  it('should maintain accessibility with listbox pattern for payment options', async () => {
    await defaultRender()

    const listbox = screen.getByRole('listbox')
    expect(listbox).toHaveAttribute('aria-label', 'Options de paiement disponibles')

    const options = screen.getAllByRole('option')
    expect(options.length).toBeGreaterThan(0)

    const selectedOptions = options.filter(
      (option) => option.getAttribute('aria-selected') === 'true',
    )
    expect(selectedOptions).toHaveLength(1)

    options.forEach((option) => {
      expect(option).toHaveAttribute('role', 'option')
      expect(option).toHaveAttribute('aria-selected')
      expect(option).toHaveAttribute('aria-describedby', 'payment-info-text')
      expect(option).toHaveAttribute('aria-label')
    })
  })

  it('should have no accessibility violations when using widget-safe structure', async () => {
    await defaultRender()

    const results = await axe(document.querySelector(TEST_CONTAINER)!, {
      rules: { 'nested-interactive': { enabled: true } },
    })
    expect(results).toHaveNoViolations()

    const headingViolations = results.violations.filter(
      (violation) => violation.id.includes('heading') || violation.id.includes('landmark'),
    )
    expect(headingViolations).toHaveLength(0)
  })

  it('should support multiple widget instances without conflicts', async () => {
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

    // Both share master's IDs, accepted until 5.x
    const widgetIds = containers.map((container) => container.id)
    expect(widgetIds[0]).toBe('alma-widget-payment-plans-main-container')
    expect(widgetIds[1]).toBe('alma-widget-payment-plans-main-container')

    expect(screen.getAllByRole('region').length).toBeGreaterThanOrEqual(4)
    expect(screen.getAllByRole('heading').length).toBeGreaterThanOrEqual(4)
  })

  it('should maintain focus management and keyboard navigation', async () => {
    await defaultRender()

    const mainButton = screen.getByRole('button', { name: /Ouvrir les options de paiement Alma/ })
    expect(mainButton).toHaveAttribute('aria-haspopup', 'dialog')

    screen.getAllByRole('option').forEach((button) => {
      expect(button).toHaveAttribute('tabindex')
      expect(button).toHaveAttribute('type', 'button')
    })

    const alertRegion = screen.getByRole('alert')
    expect(alertRegion).toHaveAttribute('aria-live', 'assertive')
  })
})
