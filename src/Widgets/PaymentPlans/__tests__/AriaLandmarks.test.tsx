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

    // Check main landmark exists
    const mainLandmark = screen.getByRole('main')
    expect(mainLandmark).toBeInTheDocument()
    expect(mainLandmark).toHaveAttribute('aria-label', 'Sélection des options de paiement Alma')

    // Check section landmark exists
    const sectionLandmark = screen.getByRole('main').querySelector('section')
    expect(sectionLandmark).toBeInTheDocument()
    expect(sectionLandmark).toHaveAttribute('aria-labelledby', 'payment-plans-title')

    // Check aside landmark exists
    const asideLandmark = screen.getByRole('complementary')
    expect(asideLandmark).toBeInTheDocument()
    expect(asideLandmark).toHaveAttribute('aria-labelledby', 'payment-info-title')

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

    // Check heading hierarchy exists (h2 for main section, h3 for aside)
    const h2Heading = screen.getByRole('heading', { level: 2 })
    expect(h2Heading).toBeInTheDocument()
    expect(h2Heading).toHaveTextContent('Options de paiement disponibles')

    const h3Heading = screen.getByRole('heading', { level: 3 })
    expect(h3Heading).toBeInTheDocument()
    expect(h3Heading).toHaveTextContent('Informations sur le plan de paiement sélectionné')
  })

  it('should maintain existing radiogroup functionality with new structure', async () => {
    render(
      <PaymentPlanWidget
        purchaseAmount={40000}
        apiData={{ domain: ApiMode.TEST, merchantId: '11gKoO333vEXacMNMUMUSc4c4g68g2Les4' }}
      />,
    )

    await screen.findByTestId('widget-container')

    // Check radiogroup still exists and functions within the section
    const radiogroup = screen.getByRole('radiogroup')
    expect(radiogroup).toBeInTheDocument()
    expect(radiogroup).toHaveAttribute('aria-label', 'Options de paiement disponibles')

    // Check radio buttons still exist within the structure
    const radioButtons = screen.getAllByRole('radio')
    expect(radioButtons.length).toBeGreaterThan(0)
  })
})
