import React from 'react'

import { screen } from '@testing-library/react'

import render from '@/test'
import {
  mockDeferredMultiInstallmentPlanWithoutFees,
  mockDeferredP1XPlan,
  mockPlansAllEligible,
  withCountry,
} from '@/test/fixtures'
import LegalMentions from 'components/Installments/LegalMentions'

const DISCLAIMER =
  "Sous réserve d'acceptation par Alma SAS (almapay.com), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com"

describe('standard PNX/Credit variant', () => {
  it('renders the without-fee-sharing wording for a plan with no customer cost', () => {
    render(<LegalMentions currentPlan={mockPlansAllEligible[2]} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 225,00 € au taux débiteur fixe de 0 % sur 1 mois. Permettant, avec un acompte de 225,00 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('renders the with-fee-sharing wording for a plan with a nonzero customer cost', () => {
    render(<LegalMentions currentPlan={mockPlansAllEligible[3]} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 300,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant, avec un acompte de 151,35 €, incluant des frais de 1,35 €, de financer un achat de 450,00 €.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
  })

  it('renders the without-fee-mention wording for a Credit plan (>4 installments) even when it has a nonzero customer cost', () => {
    render(<LegalMentions currentPlan={mockPlansAllEligible[5]} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      "Crédit de 428,95 € au taux débiteur fixe de 17,2 % sur 9 mois. Permettant, avec un acompte de 47,69 €, de financer un achat de 450,00 €.",
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

  it('does not depend on transaction_country', () => {
    const { unmount } = render(
      <LegalMentions currentPlan={withCountry(mockPlansAllEligible[2], 'FR')} />,
    )
    const frText = screen.getByTestId('legal-mentions').textContent
    unmount()

    render(<LegalMentions currentPlan={withCountry(mockPlansAllEligible[2], 'US')} />)
    const usText = screen.getByTestId('legal-mentions').textContent

    expect(usText).toBe(frText)
  })
})

describe('P1X Pay Later variant', () => {
  it('renders the without-fee-sharing wording for a deferred single-installment plan with no customer cost', () => {
    render(<LegalMentions currentPlan={mockDeferredP1XPlan} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 31 décembre 2021.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
    expect(legalMentions).not.toHaveTextContent('incluant des frais')
  })

  it('renders the with-fee-sharing wording for a deferred single-installment plan with a nonzero customer cost', () => {
    const planWithFees = {
      ...mockDeferredP1XPlan,
      customer_fee: 540,
      customer_total_cost_amount: 540,
      customer_total_cost_bps: 120,
    }

    render(<LegalMentions currentPlan={planWithFees} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 455,40 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €, incluant des frais de 5,40 €. Montant total dû : 455,40 €, prélevés le 31 décembre 2021.',
    )
    expect(legalMentions).toHaveTextContent(DISCLAIMER)
  })

  it('uses month-based deferred duration wording when deferred_months is set', () => {
    const planDeferredByMonths = { ...mockDeferredP1XPlan, deferred_days: 0, deferred_months: 2 }

    render(<LegalMentions currentPlan={planDeferredByMonths} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 2 mois. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 31 décembre 2021.',
    )
  })

  it('falls back to the epoch when there is no payment plan to read a due date from', () => {
    const planWithoutPaymentPlan = { ...mockDeferredP1XPlan, payment_plan: [] }

    render(<LegalMentions currentPlan={planWithoutPaymentPlan} />)

    const legalMentions = screen.getByTestId('legal-mentions')
    expect(legalMentions).toHaveTextContent(
      'Crédit de 450,00 € au taux débiteur fixe de 0 % sur 30 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 1 janvier 1970.',
    )
  })

  it('does not depend on transaction_country', () => {
    const { unmount } = render(
      <LegalMentions currentPlan={withCountry(mockDeferredP1XPlan, 'FR')} />,
    )
    const frText = screen.getByTestId('legal-mentions').textContent
    unmount()

    render(<LegalMentions currentPlan={withCountry(mockDeferredP1XPlan, 'US')} />)
    const usText = screen.getByTestId('legal-mentions').textContent

    expect(usText).toBe(frText)
  })
})
