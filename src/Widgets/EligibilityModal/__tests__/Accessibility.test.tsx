import React from 'react'

import { screen } from '@testing-library/react'
import { axe } from 'jest-axe'

import render from '@/test'
import { statusResponse } from '@/types'
import { mockPlansAllEligible } from 'test/fixtures'
import EligibilityModal from 'Widgets/EligibilityModal'

describe('EligibilityModal Accessibility Tests', () => {
  const onCloseMock = jest.fn()

  it('should not have any accessibility violations when open', async () => {
    const { container } = render(
      <EligibilityModal
        onClose={onCloseMock}
        eligibilityPlans={mockPlansAllEligible}
        status={statusResponse.SUCCESS}
      />,
    )

    // Wait for content to load
    await screen.findByTestId('modal-close-button')

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
})
