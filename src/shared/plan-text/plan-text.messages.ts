import { defineMessages } from '@/shared/i18n/define-messages'

export const planTextMessages = defineMessages({
  payNowButton: {
    id: 'payment-plan-strings.pay.now.button',
    defaultMessage: 'Payer maintenant',
  },
  payDeferredButton: {
    id: 'payment-plan-strings.pay.deferred.button',
    defaultMessage: 'Payer en différé : {deferredTime}',
  },
  dayAbbreviation: {
    id: 'payment-plan-strings.day-abbreviation',
    defaultMessage: 'J{deferredDays}',
  },
  monthAbbreviation: {
    id: 'payment-plan-strings.month-abbreviation',
    defaultMessage: 'M{deferredMonths}',
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

export const planSectionMessages = defineMessages({
  sectionTitle: {
    id: 'accessibility.payment-plans.section-title',
    defaultMessage: 'Options de paiement disponibles',
  },
})
