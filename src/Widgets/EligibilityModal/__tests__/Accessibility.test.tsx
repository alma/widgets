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

    // Attendre que le contenu se charge
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

    // Vérifier le bouton de fermeture (confirme que le modal est ouvert)
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

    // Vérifier que les plans sont accessibles
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

    // Vérifier que tous les éléments interactifs sont accessibles au clavier
    const interactiveElements = container.querySelectorAll('button, a, [tabindex]')
    
    // Éviter les expects conditionnels
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
