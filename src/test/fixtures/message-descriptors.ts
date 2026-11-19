import type { MessageDescriptor } from '@/shared/i18n/i18n.types'

// Copies of widget descriptors, so the shared/ tests import nothing from widgets/. The ids are the
// real ones, so the catalogues translate them. Plain objects, so `formatjs extract` skips them.
export const testMessages = {
  infoTitle: {
    id: 'eligibility-modal.info-title',
    defaultMessage: 'Comment procéder au paiement',
  },
  bullet1: {
    id: 'eligibility-modal.bullet-1',
    defaultMessage: 'Choisissez <strong>Alma</strong> au moment du paiement.',
  },
  disclaimer: {
    id: 'legal-mentions.disclaimer',
    defaultMessage:
      "Sous réserve d'acceptation par Alma SAS (<link>almapay.com</link>), {status} (code CIB : 17408). RCS Nanterre 839100575. Contact: <mail>support@almapay.com</mail>",
  },
  paymentInstitution: {
    id: 'legal-mentions.disclaimer.payment-institution',
    defaultMessage: "établissement de paiement agréé par l'ACPR",
  },
  creditOrPnxWithoutFees: {
    id: 'legal-mentions.credit-or-pnx-without-fees',
    defaultMessage:
      'Crédit de {financedAmount} au taux débiteur fixe de {customerLendingRate} sur {creditDurationInMonths} mois. Permettant, avec un acompte de {initialDeposit}, de financer un achat de {purchaseAmount}. {disclaimer}',
  },
  deferredDays: {
    id: 'payment-plan-strings.deferred.days',
    defaultMessage: '{days, number} {days, plural, one {jour} other {jours}}',
  },
} satisfies Record<string, MessageDescriptor>
