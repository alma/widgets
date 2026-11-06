import { html } from 'lit'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockPayLater30DaysEligiblePlan,
} from '@/test/fixtures'
import { renderTemplate } from '@/test/render-template'
import { warningMessageTemplate } from '@/widgets/eligibility-modal/templates/schedule/warning-message.template'

const intl = createIntl(Locale.fr)

const renderWarning = (plan: EligibilityPlanToDisplay) =>
  // Wrapped because the template returns `nothing` for an unmapped country.
  renderTemplate(html`${warningMessageTemplate({ currentPlan: plan, intl })}`)

// The template renders the sentence and nothing else, so the container's text is exactly what a
// customer reads.
const warningFor = (plan: EligibilityPlanToDisplay) => renderWarning(plan).textContent

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

  it('should render the sentence of a country given in lowercase', () => {
    expect(warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry('it'))).toBe(
      "Attention ! Emprunter de l'argent a un coût.",
    )
  })

  it('should render nothing for a country without an approved sentence', () => {
    const container = renderWarning(mockPayLater30DaysEligiblePlan.withCountry('ZZ'))

    expect(container).toBeEmptyDOMElement()
  })
})
