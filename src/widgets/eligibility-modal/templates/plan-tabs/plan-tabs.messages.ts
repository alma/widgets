import { defineMessages } from '@/shared/i18n/define-messages'

export const planTabsMessages = defineMessages({
  planButtonAriaLabel: {
    id: 'accessibility.payment-plan-button.aria-label',
    defaultMessage: 'Sélectionner le plan de paiement {planName}',
  },
  payNow: {
    id: 'payment-plan-strings.pay.now.button',
    defaultMessage: 'Payer maintenant',
  },
  dayAbbreviation: {
    id: 'payment-plan-strings.day-abbreviation',
    defaultMessage: 'J{deferredDays}',
  },
  monthAbbreviation: {
    id: 'payment-plan-strings.month-abbreviation',
    defaultMessage: 'M{deferredMonths}',
  },
  sectionTitle: {
    id: 'accessibility.payment-plans.section-title',
    defaultMessage: 'Options de paiement disponibles',
  },
})
