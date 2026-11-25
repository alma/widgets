import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { html } from 'lit'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockDeferredMultiInstallmentPlanWithFees,
  mockPayLater30DaysEligiblePlan,
  warningMessageCountries,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { warningMessageTemplate } from '@/widgets/eligibility-modal/templates/schedule/warning-message/warning-message.template'

type MessageFixture = { locales: Record<string, { messages: Record<string, string> }> }

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(
      __dirname,
      '../../../../../../tests/integration/contract/fixtures/messages.output.json',
    ),
    'utf8',
  ),
)

const renderWarning = (plan: EligibilityPlanToDisplay, locale: Locale = Locale.fr) =>
  // Wrapped because the template returns `nothing` for an unmapped country.
  renderTemplate(html`${warningMessageTemplate({ currentPlan: plan, intl: createIntl(locale) })}`)

// The template renders the sentence and nothing else, so the container's text is exactly what a
// customer reads.
const warningFor = (plan: EligibilityPlanToDisplay, locale?: Locale) =>
  renderWarning(plan, locale).textContent

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
  ])('should render the %s sentence', (country, sentence) => {
    expect(warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry(country))).toBe(sentence)
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

  it.each([Locale.de, Locale.es, Locale.it, Locale.nl, Locale.pt])(
    'should render the sentence of each country in %s, like the fixtures',
    (locale) => {
      const { messages } = locales[locale]
      const idOf = (country: string) => (country === 'UK' ? 'gb' : country.toLowerCase())

      expect(
        warningMessageCountries.map((country) =>
          warningFor(mockDeferredMultiInstallmentPlanWithFees.withCountry(country), locale),
        ),
      ).toEqual(
        warningMessageCountries.map((country) => messages[`warning-message.${idOf(country)}`]),
      )
    },
  )
})
