import { defineMessages } from '@/shared/i18n/define-messages'

export const planButtonMessages = defineMessages({
  planOptionAriaLabel: {
    id: 'accessibility.payment-plan.option.aria-label',
    defaultMessage: 'Option de paiement {planDescription}',
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
})
