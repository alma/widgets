import { defineMessages } from '@/shared/i18n/define-messages'

export const planTextMessages = defineMessages({
  payNowButton: {
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
