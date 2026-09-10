import React from 'react'

import render from '@/test'
import { EligibilityPlanToDisplay } from '@/types'
import WarningMessage from 'components/WarningMessage'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockP1XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
} from 'test/fixtures'


// The component renders the sentence and nothing else, so the container's text is exactly what a
// customer reads.
const warningFor = (plan: EligibilityPlanToDisplay) =>
  render(<WarningMessage currentPlan={plan} />).container.textContent

describe('WarningMessage', () => {
  it('should render the with-fees variant of the transaction country', () => {
    expect(warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry('IT'))).toBe(
      "Attention : emprunter de l'argent entraîne des coûts.",
    )
  })

  it('should render the without-fees variant of the same country', () => {
    expect(warningFor(mockDeferredMultiInstallmentPlanWithoutFees.withCountry('IT'))).toBe(
      'Important : un prêt est contraignant et doit être remboursé. Vérifiez le coût du prêt avant de vous engager.',
    )
  })

  it('should render the variant of a second country', () => {
    expect(warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry('DE'))).toBe(
      "Attention ! Souscrire un crédit coûte de l'argent.",
    )
  })

  it('should render the same sentence with and without fees where the mapping says so', () => {
    const withFees = warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry('FR'))
    const withoutFees = warningFor(mockDeferredMultiInstallmentPlanWithoutFees.withCountry('FR'))

    expect(withoutFees).toBe(withFees)
    expect(withFees).toBe("Attention ! Un crédit coûte de l'argent et doit être remboursé.")
  })

  it('should render the same sentence for a deferred P1X plan as for its non-deferred equivalent', () => {
    // Both plans are booked in Italy and share their fee sharing, so only the deferred status
    // differs — which must not influence the variant.
    const deferredP1X = warningFor(mockPayLater30DaysEligiblePlan.withCountry('IT'))
    const nonDeferred = warningFor(mockP1XEligiblePlan.withCountry('IT'))

    expect(deferredP1X).toBe(nonDeferred)
  })

  it('should render nothing for a country without an approved sentence', () => {
    const { container } = render(
      <WarningMessage currentPlan={mockPayLater30DaysEligiblePlan.withCountry('ZZ')} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
