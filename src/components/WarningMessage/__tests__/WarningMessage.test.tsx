import React from 'react'

import { screen } from '@testing-library/react'

import render from '@/test'
import WarningMessage from 'components/WarningMessage'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockDeferredP1XPlan,
  mockPlansAllEligible,
  withCountry,
} from 'test/fixtures'

// Picked by predicate rather than by index so the test does not depend on the fixture ordering.
// `plan.eligible` first narrows the union to EligiblePlan, which is what carries `customer_fee`.
const nonDeferredWithoutFees = mockPlansAllEligible.find(
  (plan) =>
    plan.eligible &&
    plan.deferred_days === 0 &&
    plan.deferred_months === 0 &&
    plan.customer_fee === 0,
)!

const warningText = () => screen.getByTestId('warning-message').textContent

describe('WarningMessage', () => {
  it('should render the with-fees variant of the transaction country', () => {
    render(
      <WarningMessage currentPlan={withCountry(mockDeferredMultiInstallmentPlanWithFees, 'IT')} />,
    )

    expect(warningText()).toBe("Attention : emprunter de l'argent entraîne des coûts.")
  })

  it('should render the without-fees variant of the same country', () => {
    render(
      <WarningMessage
        currentPlan={withCountry(mockDeferredMultiInstallmentPlanWithoutFees, 'IT')}
      />,
    )

    expect(warningText()).toBe(
      'Important : un prêt est contraignant et doit être remboursé. Vérifiez le coût du prêt avant de vous engager.',
    )
  })

  it('should render the variant of a second country', () => {
    render(
      <WarningMessage currentPlan={withCountry(mockDeferredMultiInstallmentPlanWithFees, 'DE')} />,
    )

    expect(warningText()).toBe("Attention ! Souscrire un crédit coûte de l'argent.")
  })

  it('should render the same sentence with and without fees where the mapping says so', () => {
    const { unmount } = render(
      <WarningMessage currentPlan={withCountry(mockDeferredMultiInstallmentPlanWithFees, 'FR')} />,
    )
    const withFees = warningText()
    unmount()

    render(
      <WarningMessage
        currentPlan={withCountry(mockDeferredMultiInstallmentPlanWithoutFees, 'FR')}
      />,
    )

    expect(warningText()).toBe(withFees)
    expect(withFees).toBe("Attention ! Un crédit coûte de l'argent et doit être remboursé.")
  })

  it('should render the same sentence for a deferred P1X plan as for its non-deferred equivalent', () => {
    // Both plans are booked in Italy and share their fee sharing, so only the deferred status
    // differs — which must not influence the variant.
    const { unmount } = render(
      <WarningMessage currentPlan={withCountry(mockDeferredP1XPlan, 'IT')} />,
    )
    const deferredP1X = warningText()
    unmount()

    render(<WarningMessage currentPlan={withCountry(nonDeferredWithoutFees, 'IT')} />)

    expect(deferredP1X).toBe(warningText())
  })

  it('should render nothing for a country without an approved sentence', () => {
    render(<WarningMessage currentPlan={withCountry(mockDeferredP1XPlan, 'ZZ')} />)

    expect(screen.queryByTestId('warning-message')).not.toBeInTheDocument()
  })
})
