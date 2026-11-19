import { defineMessages } from '@/shared/i18n/define-messages'

export const planDescriptionMessages = defineMessages({
  payNow: {
    id: 'payment-plan-strings.pay.now.button',
    defaultMessage: 'Payer maintenant',
  },
  payDeferred: {
    id: 'payment-plan-strings.pay.deferred.button',
    defaultMessage: 'Payer en différé : {deferredTime}',
  },
  deferredDays: {
    id: 'payment-plan-strings.deferred.days',
    defaultMessage: '{days, number} {days, plural, one {jour} other {jours}}',
  },
  deferredMonths: {
    id: 'payment-plan-strings.deferred.months',
    defaultMessage: '{months, number} {months, plural, one {mois} other {mois}}',
  },
})
