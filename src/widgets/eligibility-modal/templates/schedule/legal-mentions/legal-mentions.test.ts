import { screen, within } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockP10XEligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { legalMentionsTemplate } from '@/widgets/eligibility-modal/templates/schedule/legal-mentions/legal-mentions.template'

const renderLegalMentions = (currentPlan: EligibilityPlanToDisplay, locale: Locale = Locale.fr) =>
  renderTemplate(legalMentionsTemplate({ currentPlan, intl: createIntl(locale) }))

// The whole text, with U+202F and U+00A0 as plain spaces, as the golden text files keep it.
const legalMentionsText = () =>
  (screen.getByTestId('legal-mentions').textContent ?? '').replace(/\s+/g, ' ').trim()

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

  it('should keep a fixed borrowing rate of 0 % for a PNX plan with fees and an APR', () => {
    // The API sends the APR of the fees for a PNX plan with fees.
    renderLegalMentions({ ...mockP4XEligiblePlanWithFees, annual_interest_rate: 525 })

    expect(legalMentionsText()).toBe(
      "Crédit de 337,50 € au taux débiteur fixe de 0 % sur 3 mois. Permettant, avec un acompte de 123,12 €, incluant des frais de 10,62 €, de financer un achat de 450,00 €. Sous réserve d'acceptation par Alma SAS (almapay.com), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com",
    )
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

  it.each([
    [
      'J+15',
      mockP1XEligiblePlan.withDeferredDays(15),
      "Crédit de 450,00 € au taux débiteur fixe de 0 % sur 15 jours. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 16 décembre 2021. Le coût du crédit est porté par l'enseigne. Sous réserve d'acceptation par Alma SAS (almapay.com), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com",
    ],
    [
      'M+1',
      mockPayLaterOneMonthEligiblePlan,
      "Crédit de 450,00 € au taux débiteur fixe de 0 % sur 1 mois. Permettant de financer un achat de 450,00 €. Montant total dû : 450,00 €, prélevés le 1 janvier 2022. Le coût du crédit est porté par l'enseigne. Sous réserve d'acceptation par Alma SAS (almapay.com), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: support@almapay.com",
    ],
  ])('should render the whole legal mention of the %s plan', (_name, plan, text) => {
    renderLegalMentions(plan)

    expect(legalMentionsText()).toBe(text)
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

// Leaves out the wordings that look wrong: a duration of 1 month, nl Pay Later and it credit.
describe('other locales', () => {
  const payLater = mockPayLater30DaysEligiblePlan
  const pnxWithFeesOutsideFrance = mockP3XEligiblePlanWithFees.withCountry('NL')
  const credit = mockP10XEligiblePlan

  it.each([
    [
      Locale.de,
      'Pay Later',
      payLater,
      'Kredit über 450,00 € zum festen Sollzinssatz von 0 % über 30 Tage. Zur Finanzierung eines Kaufs von 450,00 €. Gesamtbetrag: 450,00 €, abgebucht am 31. Dezember 2021. Die Kreditkosten werden vom Unternehmen getragen. Vorbehaltlich der Genehmigung durch Alma SAS (almapay.com), ein von der ACPR zugelassenes Finanzierungsinstitut (CIB-Code: 17408), eingetragen im Handels- und Gesellschaftsregister Nanterre unter der Nummer 839100575. Kontakt: support@almapay.com',
    ],
    [
      Locale.de,
      'PNX with fees outside France',
      pnxWithFeesOutsideFrance,
      'Für einen Einkauf im Wert von 450,00 € beträgt die Anzahlung 151,35 € einschließlich Gebühren in Höhe von 1,35 €. Der Kreditbetrag beläuft sich auf 300,00 € bei einem festen Sollzinssatz von 0 % p. a. und einer Laufzeit von 2 Monaten. Vorbehaltlich der Genehmigung durch Alma SAS (almapay.com), ein von der ACPR zugelassenes Zahlungsinstitut (CIB-Code: 17408), eingetragen im Handels- und Gesellschaftsregister Nanterre unter der Nummer 839100575. Kontakt: support@almapay.com',
    ],
    [
      Locale.de,
      'credit',
      credit,
      'Für einen Einkauf im Wert von 450,00 € beträgt die Anzahlung 47,77 €. Der Kreditbetrag beläuft sich auf 429,48 € bei einem festen Sollzinssatz von 17,2 % p. a. und einer Laufzeit von 9 Monaten. Vorbehaltlich der Genehmigung durch Alma SAS (almapay.com), ein von der ACPR zugelassenes Finanzierungsinstitut (CIB-Code: 17408), eingetragen im Handels- und Gesellschaftsregister Nanterre unter der Nummer 839100575. Kontakt: support@almapay.com',
    ],
    [
      Locale.es,
      'Pay Later',
      payLater,
      'Crédito de 450,00 € con un tipo de interés deudor fijo de 0 % en 30 días. Que permite financiar una compra de 450,00 €. Importe total adeudado: 450,00 €, que se deducirá el 31 de diciembre de 2021. El coste del crédito corre a cargo de la marca. Sujeto a la aceptación por parte de Alma SAS (almapay.com), entidad de financiación autorizada por la ACPR (código CIB: 17408). Inscrita en el Registro Mercantil de Nanterre con el número 839100575. Contacto: support@almapay.com',
    ],
    [
      Locale.es,
      'PNX with fees outside France',
      pnxWithFeesOutsideFrance,
      'Crédito de 300,00 € a un tipo de interés fijo del 0 % durante 2 meses. Permite, con un pago inicial de 151,35 € que incluye gastos de 1,35 €, financiar una compra de 450,00 €. Sujeto a la aceptación por parte de Alma SAS (almapay.com), entidad de pago autorizada por la ACPR (código CIB: 17408). Inscrita en el Registro Mercantil de Nanterre con el número 839100575. Contacto: support@almapay.com',
    ],
    [
      Locale.es,
      'credit',
      credit,
      'Crédito de 429,48 € a un tipo de interés fijo del 17,2 % durante 9 meses. Permite, con un pago inicial de 47,77 €, financiar una compra de 450,00 €. Sujeto a la aceptación por parte de Alma SAS (almapay.com), entidad de financiación autorizada por la ACPR (código CIB: 17408). Inscrita en el Registro Mercantil de Nanterre con el número 839100575. Contacto: support@almapay.com',
    ],
    [
      Locale.it,
      'Pay Later',
      payLater,
      "Prestito di 450,00 € con tasso fisso dello 0% su 30 giorni. Alma finanzia un acquisto di 450,00 €. Importo totale dovuto: 450,00 €, addebitato il 31 dicembre 2021. Il costo del credito è a carico del marchio. Previa accettazione da parte di Alma SAS (almapay.com), società di finanziamento autorizzata dall'ACPR (codice CIB: 17408). RCS Nanterre 839100575. Contatto: support@almapay.com",
    ],
    [
      Locale.it,
      'PNX with fees outside France',
      pnxWithFeesOutsideFrance,
      "Prestito di 300,00 € con tasso fisso dello 0% per 2 mesi. Con un acconto di 151,35 € comprensivo di spese pari a 1,35 €, Alma finanzia un acquisto di 450,00 €. Previa accettazione da parte di Alma SAS (almapay.com), istituto di pagamento autorizzato dall'ACPR (codice CIB: 17408). RCS Nanterre 839100575. Contatto: support@almapay.com",
    ],
    [
      Locale.nl,
      'PNX with fees outside France',
      pnxWithFeesOutsideFrance,
      'Krediet van € 300,00 tegen een vaste debetrente van 0% over een looptijd van 2 maanden. Hiermee kunt u, met een aanbetaling van € 151,35 inclusief kosten van € 1,35, een aankoop van € 450,00 financieren. Onder voorbehoud van goedkeuring door Alma SAS (almapay.com), een betaalinstelling erkend door de ACPR (CIB-code: 17408). RCS Nanterre 839100575. Contact: support@almapay.com',
    ],
    [
      Locale.nl,
      'credit',
      credit,
      'Krediet van € 429,48 tegen een vaste debetrente van 17,2% over een looptijd van 9 maanden. Hiermee kunt u, met een aanbetaling van € 47,77, een aankoop van € 450,00 financieren. Onder voorbehoud van goedkeuring door Alma SAS (almapay.com), een door de ACPR erkende financieringsmaatschappij (CIB-code: 17408). RCS Nanterre 839100575. Contact: support@almapay.com',
    ],
    [
      Locale.pt,
      'Pay Later',
      payLater,
      'Crédito de € 450,00 com taxa de juro fixa de 0% em 30 dias. Destinado a financiar uma compra de € 450,00. Montante total a pagar: € 450,00, a cobrar em 31 de dezembro de 2021. O custo do crédito é suportado pela marca. Sujeito à aprovação da Alma SAS (almapay.com), entidade financeira autorizada pela ACPR (código CIB 17408). RCS Nanterre 839100575. Contacto: support@almapay.com',
    ],
    [
      Locale.pt,
      'PNX with fees outside France',
      pnxWithFeesOutsideFrance,
      'Para uma compra de € 450,00: paga um valor inicial de € 151,35 que inclui € 1,35 de custos. O valor restante financiado é de € 300,00, a taxa de juros fixa de 0% durante 2 meses. Sujeito à aprovação da Alma SAS (almapay.com), entidade de pagamento autorizada pela ACPR (código CIB 17408). RCS Nanterre 839100575. Contacto: support@almapay.com',
    ],
    [
      Locale.pt,
      'credit',
      credit,
      'Para uma compra de € 450,00: paga um valor inicial de € 47,77. O valor restante financiado é de € 429,48, a taxa de juros fixa de 17,2% durante 9 meses. Sujeito à aprovação da Alma SAS (almapay.com), entidade financeira autorizada pela ACPR (código CIB 17408). RCS Nanterre 839100575. Contacto: support@almapay.com',
    ],
  ])('should compose the %s legal mention of a %s plan', (locale, _kind, plan, text) => {
    renderLegalMentions(plan, locale)

    expect(legalMentionsText()).toBe(text)
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
