import React from 'react'

import { screen } from '@testing-library/react'

import render from '@/test'
import {
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockP10XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
} from '@/test/fixtures'
import LegalMentions from 'components/Installments/LegalMentions'

const DISCLAIMER =
  "Sous réserve d'acceptation par Alma SAS (almapay.com), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com"
const PAYMENT_INSTITUTION_DISCLAIMER =
  "Sous réserve d'acceptation par Alma SAS (almapay.com), établissement de paiement agréé par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com"

const CREDIT_COST_BORNE_BY_MERCHANT = "Le coût du crédit est porté par l'enseigne."

const FRENCH_COUNTRIES = ['FR', 'fr']
const OTHER_COUNTRIES = ['LU', 'BE', 'NL', 'IT', 'DE', 'PT', 'ES', 'GB', 'UK', 'US']

describe('standard PNX/Credit variant', () => {
  it('renders the without-fee-sharing wording for a plan with no customer cost', () => {
    render(<LegalMentions currentPlan={mockP2XEligiblePlan} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 225,00 € au taux débiteur fixe de 0 % sur 1 mois. Permettant, avec un acompte de 225,00 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('renders the with-fee-sharing wording for a plan with a nonzero customer cost', () => {
    render(<LegalMentions currentPlan={mockP3XEligiblePlanWithFees} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 300,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant, avec un acompte de 151,35 €, incluant des frais de 1,35 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
  })

  it('renders the without-fee-mention wording for a Credit plan (>4 installments) even when it has a nonzero customer cost', () => {
    render(<LegalMentions currentPlan={mockP10XEligiblePlan} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 429,48 € au taux débiteur fixe de 17,2 % sur 9 mois. Permettant, avec un acompte de 47,77 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('uses the standard wording (not Pay Later) for a PNX plan that is also deferred', () => {
    render(<LegalMentions currentPlan={mockDeferredMultiInstallmentPlanWithoutFees} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant, avec un acompte de 0,00 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('Montant total dû')
  })

  it.each(FRENCH_COUNTRIES)(
    'uses the financing company disclaimer for a %s transaction',
    (country) => {
      render(<LegalMentions currentPlan={mockP2XEligiblePlan.withCountry(country)} />)

      expect(screen.getByTestId('legal-mentions')).toHaveTextContent(DISCLAIMER)
    },
  )

  it.each(OTHER_COUNTRIES)(
    'uses the payment institution disclaimer for a %s transaction',
    (country) => {
      render(<LegalMentions currentPlan={mockP2XEligiblePlan.withCountry(country)} />)

      expect(screen.getByTestId('legal-mentions')).toHaveTextContent(PAYMENT_INSTITUTION_DISCLAIMER)
    },
  )
})

describe('P1X Pay Later variant', () => {
  it('renders the without-fee-sharing wording for a deferred single-installment plan with no customer cost', () => {
    render(<LegalMentions currentPlan={mockPayLater30DaysEligiblePlan} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 31 décembre 2021.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('renders the with-fee-sharing wording for a deferred single-installment plan with a nonzero customer cost', () => {
    const planWithFees = mockPayLater30DaysEligiblePlan.withFees(540)

    render(<LegalMentions currentPlan={planWithFees} />)

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

    render(<LegalMentions currentPlan={planDeferredByMonths} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 31 décembre 2021.',
    )
  })

  it('falls back to the epoch when there is no payment plan to read a due date from', () => {
    const planWithoutPaymentPlan = { ...mockPayLater30DaysEligiblePlan, payment_plan: [] }

    render(<LegalMentions currentPlan={planWithoutPaymentPlan} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 1 janvier 1970.',
    )
  })

  it.each(FRENCH_COUNTRIES)(
    'uses the financing company disclaimer for a %s transaction',
    (country) => {
      render(<LegalMentions currentPlan={mockPayLater30DaysEligiblePlan.withCountry(country)} />)

      expect(screen.getByTestId('legal-mentions')).toHaveTextContent(DISCLAIMER)
    },
  )

  it.each(OTHER_COUNTRIES)(
    'uses the payment institution disclaimer for a %s transaction',
    (country) => {
      render(<LegalMentions currentPlan={mockPayLater30DaysEligiblePlan.withCountry(country)} />)

      expect(screen.getByTestId('legal-mentions')).toHaveTextContent(PAYMENT_INSTITUTION_DISCLAIMER)
    },
  )
})

describe('credit cost borne by the merchant', () => {
  it('adds the sentence between the plan wording and the disclaimer', () => {
    render(<LegalMentions currentPlan={mockP2XEligiblePlan} />)

    expect(screen.getByTestId('legal-mentions')).toHaveTextContent(
      `de financer un achat de 450,00 €. ${CREDIT_COST_BORNE_BY_MERCHANT} ${DISCLAIMER}`,
    )
  })

  it.each([
    ['PNX', mockP2XEligiblePlan],
    ['deferred PNX', mockDeferredMultiInstallmentPlanWithoutFees],
    ['Pay Later', mockPayLater30DaysEligiblePlan],
    ['0% Credit', mockP2XEligiblePlan.withInstallmentsCount(10)],
  ])('shows it for a French %s plan that costs the customer nothing', (_, plan) => {
    render(<LegalMentions currentPlan={plan} />)

    expect(screen.getByTestId('legal-mentions')).toHaveTextContent(CREDIT_COST_BORNE_BY_MERCHANT)
  })

  it.each([
    ['PNX with fees', mockP3XEligiblePlanWithFees],
    ['Pay Later with fees', mockPayLater30DaysEligiblePlan.withFees(540)],
    ['Credit with interest', mockP10XEligiblePlan],
  ])('hides it for a French %s plan', (_, plan) => {
    render(<LegalMentions currentPlan={plan} />)

    expect(screen.getByTestId('legal-mentions')).not.toHaveTextContent(
      CREDIT_COST_BORNE_BY_MERCHANT,
    )
  })

  it('shows it whatever the case of the transaction country', () => {
    render(<LegalMentions currentPlan={mockP2XEligiblePlan.withCountry('fr')} />)

    expect(screen.getByTestId('legal-mentions')).toHaveTextContent(CREDIT_COST_BORNE_BY_MERCHANT)
  })

  it.each(OTHER_COUNTRIES)('hides it for a %s transaction', (country) => {
    render(<LegalMentions currentPlan={mockP2XEligiblePlan.withCountry(country)} />)

    expect(screen.getByTestId('legal-mentions')).not.toHaveTextContent(
      CREDIT_COST_BORNE_BY_MERCHANT,
    )
  })
})
