import { defineMessages } from '@/shared/i18n/define-messages'

export const legalMentionsMessages = defineMessages({
  disclaimer: {
    id: 'legal-mentions.disclaimer',
    defaultMessage:
      "Sous réserve d'acceptation par Alma SAS (<link>almapay.com</link>), {status} (code CIB : 17408). RCS Nanterre 839100575. Contact: <mail>support@almapay.com</mail>",
  },
  financingCompany: {
    id: 'legal-mentions.disclaimer.financing-company',
    defaultMessage: "société de financement agréée par l'ACPR",
  },
  paymentInstitution: {
    id: 'legal-mentions.disclaimer.payment-institution',
    defaultMessage: "établissement de paiement agréé par l'ACPR",
  },
  creditCostBorneByMerchant: {
    id: 'legal-mentions.credit-cost-borne-by-merchant',
    defaultMessage: "Le coût du crédit est porté par l'enseigne.",
  },
  creditOrPnxWithoutFees: {
    id: 'legal-mentions.credit-or-pnx-without-fees',
    defaultMessage:
      'Crédit de {financedAmount} au taux débiteur fixe de {customerLendingRate} sur {creditDurationInMonths} mois. Permettant, avec un acompte de {initialDeposit}, de financer un achat de {purchaseAmount}. {disclaimer}',
  },
  payLaterWithFees: {
    id: 'legal-mentions.pay-later-with-fees',
    defaultMessage:
      'Crédit de {financedAmount} au taux débiteur fixe de {customerLendingRate} sur {deferredDuration}. Permettant de financer un achat de {purchaseAmount}, incluant des frais de {fees}. Montant total dû : {totalDue}, prélevés le {dueDate}. {disclaimer}',
  },
  payLaterWithoutFees: {
    id: 'legal-mentions.pay-later-without-fees',
    defaultMessage:
      'Crédit de {financedAmount} au taux débiteur fixe de {customerLendingRate} sur {deferredDuration}. Permettant de financer un achat de {purchaseAmount}. Montant total dû : {totalDue}, prélevés le {dueDate}. {disclaimer}',
  },
  pnxWithFees: {
    id: 'legal-mentions.pnx-with-fees',
    defaultMessage:
      'Crédit de {financedAmount} au taux débiteur fixe de {customerLendingRate} sur {creditDurationInMonths} mois. Permettant, avec un acompte de {initialDeposit}, incluant des frais de {fees}, de financer un achat de {purchaseAmount}. {disclaimer}',
  },
})
