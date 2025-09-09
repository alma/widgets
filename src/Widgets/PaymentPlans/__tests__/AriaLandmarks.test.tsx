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

describe('PaymentPlans ARIA Landmarks (RGAA 12.6)', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockUseFetchEligibility.mockImplementation(() => [mockButtonPlans, statusResponse.SUCCESS])
  })

  it('should have proper landmark structure for RGAA 12.6 compliance', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check widget container exists (now a simple div without aria-label)
    const widgetContainer = screen.getByTestId('widget-container')
    expect(widgetContainer).toBeInTheDocument()

    // Check section landmark exists at top level
    const sectionLandmark = screen.getByRole('region')
    expect(sectionLandmark).toBeInTheDocument()
    expect(sectionLandmark).toHaveAttribute('aria-labelledby', 'payment-plans-title')

    // Check aside landmark exists at top level (not nested)
    const asideLandmark = screen.getByRole('complementary')
    expect(asideLandmark).toBeInTheDocument()
    expect(asideLandmark).toHaveAttribute('aria-labelledby', 'payment-info-title')

    // Verify aside is not nested inside section (fixes landmark-complementary-is-top-level)
    expect(sectionLandmark.contains(asideLandmark)).toBe(false)

    // Check screen reader only titles exist
    const paymentPlansTitle = document.getElementById('payment-plans-title')
    expect(paymentPlansTitle).toBeInTheDocument()
    expect(paymentPlansTitle).toHaveClass('sr-only')

    const paymentInfoTitle = document.getElementById('payment-info-title')
    expect(paymentInfoTitle).toBeInTheDocument()
    expect(paymentInfoTitle).toHaveClass('sr-only')
  })

  it('should have no accessibility violations with new landmark structure', async () => {
    const { container } = render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Test accessibility with all rules including landmarks
    const results = await axe(container, {
      rules: {
        'landmark-one-main': { enabled: true },
        'landmark-unique': { enabled: true },
        region: { enabled: true },
      },
    })

    expect(results).toHaveNoViolations()
  })

  it('should have proper heading hierarchy for screen readers', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check heading hierarchy exists (h5 for main section, h6 for aside)
    const h5Heading = screen.getByRole('heading', { level: 5 })
    expect(h5Heading).toBeInTheDocument()
    expect(h5Heading).toHaveTextContent('Options de paiement disponibles')

    const h6Heading = screen.getByRole('heading', { level: 6 })
    expect(h6Heading).toBeInTheDocument()
    expect(h6Heading).toHaveTextContent('Informations sur le plan de paiement sélectionné')
  })

  it('should maintain existing listbox functionality with new structure', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check listBox still exists and functions within the section
    const listBox = screen.getByRole('listbox')
    expect(listBox).toBeInTheDocument()
    expect(listBox).toHaveAttribute('aria-label', 'Options de paiement disponibles')

    // Check option buttons still exist within the structure
    const optionButtons = screen.getAllByRole('option')
    expect(optionButtons.length).toBeGreaterThan(0)
  })
})
