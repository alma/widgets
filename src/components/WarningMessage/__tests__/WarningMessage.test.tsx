import React from 'react'

import render from '@/test'
import { EligibilityPlanToDisplay } from '@/types'
import WarningMessage from 'components/WarningMessage'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockPayLater30DaysEligiblePlan,
} from 'test/fixtures'

// The component renders the sentence and nothing else, so the container's text is exactly what a
// customer reads.
const warningFor = (plan: EligibilityPlanToDisplay) =>
  render(<WarningMessage currentPlan={plan} />).container.textContent

describe('WarningMessage', () => {
  it.each([
    ['NL', "Attention, emprunter de l'argent coûte aussi de l'argent."],
    ['IT', "Attention ! Emprunter de l'argent a un coût."],
    ['DE', "Attention ! Emprunter de l'argent a un coût."],
    ['PT', "Attention ! Emprunter de l'argent a un coût."],
    ['ES', "Attention ! Emprunter de l'argent coûte de l'argent."],
    ['FR', "Attention ! Un crédit coûte de l'argent et doit être remboursé."],
    ['BE', "Attention, emprunter de l'argent coûte aussi de l'argent."],
    ['LU', "Attention ! Emprunter de l'argent coûte de l'argent."],
    ['GB', "Attention ! Emprunter de l'argent a un coût."],
    ['UK', "Attention ! Emprunter de l'argent a un coût."],
  ])('should render the %s sentence whether the plan has fees or not', (country, sentence) => {
    expect(warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry(country))).toBe(sentence)
    expect(warningFor(mockDeferredMultiInstallmentPlanWithoutFees.withCountry(country))).toBe(
      sentence,
    )
  })

  it('should render nothing for a country without an approved sentence', () => {
    const { container } = render(
      <WarningMessage currentPlan={mockPayLater30DaysEligiblePlan.withCountry('ZZ')} />,
    )

    expect(container).toBeEmptyDOMElement()
  })
})
