import { defineMessages } from '@/shared/i18n/define-messages'

export const modalContentMessages = defineMessages({
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
