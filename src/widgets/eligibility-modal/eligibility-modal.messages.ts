import { defineMessages } from '@/shared/i18n/define-messages'

export const modalShellMessages = defineMessages({
  closeButtonAriaLabel: {
    id: 'accessibility.close-button.aria-label',
    defaultMessage: 'Fermer la fenêtre',
  },
})

export const skipLinksMessages = defineMessages({
  navigationAriaLabel: {
    id: 'accessibility.skip-links.navigation.aria-label',
    defaultMessage: 'Navigation rapide',
  },
})

export const installmentMessages = defineMessages({
  today: {
    id: 'installments.today',
    defaultMessage: "Aujourd'hui",
  },
})

export const totalBlockMessages = defineMessages({
  totalAmount: {
    id: 'installments.total-amount',
    defaultMessage: 'Total',
  },
  totalFees: {
    id: 'installments.total-fees',
    defaultMessage: 'Dont frais (TTC)',
  },
  totalCreditCost: {
    id: 'credit-features.total-credit-cost',
    defaultMessage: 'Dont coût du crédit (TTC)',
  },
  creditCostDisplay: {
    id: 'credit-features.credit-cost-display',
    defaultMessage: '{creditCost} (TAEG {annualPercentageRate})',
  },
})

export const legalMentionsMessages = defineMessages({
  disclaimer: {
    id: 'legal-mentions.disclaimer',
    defaultMessage:
      "Sous réserve d'acceptation par Alma SAS (<link>almapay.com</link>), société de financement agréée par l'ACPR (code CIB : 17408). RCS Nanterre 839100575. Contact: <mail>support@almapay.com</mail>",
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

export const warningMessages = defineMessages({
  fr: {
    id: 'warning-message.fr',
    defaultMessage: "Attention ! Un crédit coûte de l'argent et doit être remboursé.",
  },
  lu: {
    id: 'warning-message.lu',
    defaultMessage: "Attention ! Emprunter de l'argent coûte de l'argent.",
  },
  be: {
    id: 'warning-message.be',
    defaultMessage: "Attention, emprunter de l'argent coûte aussi de l'argent.",
  },
  nl: {
    id: 'warning-message.nl',
    defaultMessage: "Attention, emprunter de l'argent coûte aussi de l'argent.",
  },
  it: {
    id: 'warning-message.it',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  de: {
    id: 'warning-message.de',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  pt: {
    id: 'warning-message.pt',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
  es: {
    id: 'warning-message.es',
    defaultMessage: "Attention ! Emprunter de l'argent coûte de l'argent.",
  },
  gb: {
    id: 'warning-message.gb',
    defaultMessage: "Attention ! Emprunter de l'argent a un coût.",
  },
})

export const eligibilityModalMessages = defineMessages({
  skipToPaymentPlans: {
    id: 'skip-links.payment-plans',
    defaultMessage: 'Aller aux options de paiement',
  },
  skipToPaymentInfo: {
    id: 'skip-links.payment-info',
    defaultMessage: 'Aller aux informations de paiement',
  },
  skipToPaymentSchedule: {
    id: 'skip-links.payment-schedule',
    defaultMessage: 'Aller au calendrier de paiement',
  },
  noEligibility: {
    id: 'eligibility-modal.no-eligibility',
    defaultMessage: "Oups, il semblerait que la simulation n'ait pas fonctionné.",
  },
})

export const titleMessages = defineMessages({
  deferredPlan: {
    id: 'eligibility-modal.title-deferred-plan',
    defaultMessage: 'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
  },
  payNow: {
    id: 'eligibility-modal.title-pay-now',
    defaultMessage: 'Payez comptant par carte bancaire avec Alma.',
  },
  normal: {
    id: 'eligibility-modal.title-normal',
    defaultMessage: 'Payez en plusieurs fois par carte bancaire avec Alma.',
  },
})

export const infoMessages = defineMessages({
  infoTitle: {
    id: 'eligibility-modal.info-title',
    defaultMessage: 'Comment procéder au paiement',
  },
  p1xBullet1: {
    id: 'eligibility-modal.p1x-bullet-1',
    defaultMessage: 'Choisissez <strong>Alma - Payer maintenant</strong> au moment du paiement.',
  },
  bullet1: {
    id: 'eligibility-modal.bullet-1',
    defaultMessage: 'Choisissez <strong>Alma</strong> au moment du paiement.',
  },
  p1xBullet2: {
    id: 'eligibility-modal.p1x-bullet-2',
    defaultMessage: 'Renseignez les informations de votre <strong>carte bancaire.</strong>',
  },
  bullet2: {
    id: 'eligibility-modal.bullet-2',
    defaultMessage: 'Laissez-vous guider et validez votre paiement en <strong>2 minutes.</strong>',
  },
  p1xBullet3: {
    id: 'eligibility-modal.p1x-bullet-3',
    defaultMessage: '<strong>La validation </strong> de votre paiement est instantanée !',
  },
  bullet3: {
    id: 'eligibility-modal.bullet-3',
    defaultMessage:
      '<strong>Gardez le contrôle</strong> en avançant ou reculant vos échéances à votre rythme.',
  },
})

export const planTabsMessages = defineMessages({
  planButtonAriaLabel: {
    id: 'accessibility.payment-plan-button.aria-label',
    defaultMessage: 'Sélectionner le plan de paiement {planName}',
  },
})

export const scheduleMessages = defineMessages({
  scheduleTitle: {
    id: 'accessibility.payment-schedule-title',
    defaultMessage: 'Calendrier de paiement',
  },
})
