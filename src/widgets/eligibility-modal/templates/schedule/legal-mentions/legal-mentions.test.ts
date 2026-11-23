import { screen, within } from '@testing-library/dom'
import { axe } from 'vitest-axe'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockP10XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { legalMentionsTemplate } from '@/widgets/eligibility-modal/templates/schedule/legal-mentions/legal-mentions.template'

const intl = createIntl(Locale.fr)

const renderLegalMentions = (currentPlan: EligibilityPlanToDisplay) =>
  renderTemplate(legalMentionsTemplate({ currentPlan, intl }))

const DISCLAIMER =
  "Sous réserve d'acceptation par Alma SAS (almapay.com), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com"
const PAYMENT_INSTITUTION_DISCLAIMER =
  "Sous réserve d'acceptation par Alma SAS (almapay.com), établissement de paiement agréé par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com"

const CREDIT_COST_BORNE_BY_MERCHANT = "Le coût du crédit est porté par l'enseigne."

const FRENCH_COUNTRIES = ['FR', 'fr']

describe('standard PNX/Credit variant', () => {
  it('renders the without-fee-sharing wording for a plan with no customer cost', () => {
    renderLegalMentions(mockP2XEligiblePlan)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 225,00 € au taux débiteur fixe de 0 % sur 1 mois. Permettant, avec un acompte de 225,00 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('renders the with-fee-sharing wording for a plan with a nonzero customer cost', () => {
    renderLegalMentions(mockP3XEligiblePlanWithFees)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 300,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant, avec un acompte de 151,35 €, incluant des frais de 1,35 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
  })

  it('renders the without-fee-mention wording for a Credit plan (>4 installments) even when it has a nonzero customer cost', () => {
    renderLegalMentions(mockP10XEligiblePlan)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 429,48 € au taux débiteur fixe de 17,2 % sur 9 mois. Permettant, avec un acompte de 47,77 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it.each(FRENCH_COUNTRIES)(
    'uses the financing company disclaimer for a %s transaction',
    (country) => {
      renderLegalMentions(mockP2XEligiblePlan.withCountry(country))

      expect(screen.getByTestId('legal-mentions')).toHaveTextContent(DISCLAIMER)
    },
  )

  it('uses the payment institution disclaimer for a LU transaction', () => {
    renderLegalMentions(mockP2XEligiblePlan.withCountry('LU'))

    expect(screen.getByTestId('legal-mentions')).toHaveTextContent(PAYMENT_INSTITUTION_DISCLAIMER)
  })
})

describe('P1X Pay Later variant', () => {
  it('renders the without-fee-sharing wording for a deferred single-installment plan with no customer cost', () => {
    renderLegalMentions(mockPayLater30DaysEligiblePlan)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 31 décembre 2021.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('renders the with-fee-sharing wording for a deferred single-installment plan with a nonzero customer cost', () => {
    const planWithFees = mockPayLater30DaysEligiblePlan.withFees(540)

    renderLegalMentions(planWithFees)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 455,40 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €, incluant des frais de 5,40 €. Montant total dû : 455,40 €, prélevés le 31 décembre 2021.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
  })

  it('uses month-based deferred duration wording when deferred_months is set', () => {
    const planDeferredByMonths = {
      ...mockPayLater30DaysEligiblePlan,
      deferred_days: 0,
      deferred_months: 2,
    }

    renderLegalMentions(planDeferredByMonths)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 31 décembre 2021.',
    )
  })

  it('falls back to the epoch when there is no payment plan to read a due date from', () => {
    const planWithoutPaymentPlan = { ...mockPayLater30DaysEligiblePlan, payment_plan: [] }

    renderLegalMentions(planWithoutPaymentPlan)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 1 janvier 1970.',
    )
  })
})

describe('credit cost borne by the merchant', () => {
  it('adds the sentence between the plan wording and the disclaimer', () => {
    renderLegalMentions(mockP2XEligiblePlan)

    expect(screen.getByTestId('legal-mentions')).toHaveTextContent(
      `de financer un achat de 450,00 €. ${CREDIT_COST_BORNE_BY_MERCHANT} ${DISCLAIMER}`,
    )
  })

  it('hides it for a French PNX with fees plan', () => {
    renderLegalMentions(mockP3XEligiblePlanWithFees)

    expect(screen.getByTestId('legal-mentions')).not.toHaveTextContent(
      CREDIT_COST_BORNE_BY_MERCHANT,
    )
  })

  it('hides it for a LU transaction', () => {
    renderLegalMentions(mockP2XEligiblePlan.withCountry('LU'))

    expect(screen.getByTestId('legal-mentions')).not.toHaveTextContent(
      CREDIT_COST_BORNE_BY_MERCHANT,
    )
  })
})

describe('accessibility', () => {
  it.each([
    ['a Credit plan', mockP10XEligiblePlan],
    ['a Pay Later plan', mockPayLater30DaysEligiblePlan],
  ])('should not have any accessibility violations for %s', async (_name, plan) => {
    const container = renderLegalMentions(plan)

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('disclaimer links', () => {
  it('should render the website and support links with their attributes', () => {
    renderLegalMentions(mockP2XEligiblePlan)

    const legalMentions = screen.getByTestId('legal-mentions')
    const website = within(legalMentions).getByRole('link', { name: 'almapay.com' })
    expect(website).toHaveAttribute('href', 'https://almapay.com')
    expect(website).toHaveAttribute('target', '_blank')
    expect(website).toHaveAttribute('rel', 'noopener noreferrer')
    expect(website).toHaveClass('disclaimerLink', { exact: true })
    const mail = within(legalMentions).getByRole('link', { name: 'support@almapay.com' })
    expect(mail).toHaveAttribute('href', 'mailto:support@almapay.com')
    expect(mail).not.toHaveAttribute('target')
    expect(mail).toHaveClass('disclaimerLink', { exact: true })
  })
})
