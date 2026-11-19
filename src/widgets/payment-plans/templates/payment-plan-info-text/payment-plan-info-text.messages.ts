import { defineMessages } from '@/shared/i18n/define-messages'

export const paymentPlanInfoTextMessages = defineMessages({
  noFee: {
    id: 'payment-plan-strings.no-fee',
    defaultMessage: '(sans frais)',
  },
  credit: {
    id: 'payment-plan-strings.credit',
    defaultMessage: 'Cliquez pour en savoir plus',
  },
  ineligibleGreaterThanMax: {
    id: 'payment-plan-strings.ineligible-greater-than-max',
    defaultMessage: "Jusqu'à {maxAmount}",
  },
  ineligibleLowerThanMin: {
    id: 'payment-plan-strings.ineligible-lower-than-min',
    defaultMessage: 'À partir de {minAmount}',
  },
  deferred: {
    id: 'payment-plan-strings.deferred',
    defaultMessage: '{totalAmount} à payer le {dueDate}',
  },
  payNow: {
    id: 'payment-plan-strings.pay-now',
    defaultMessage: 'Payer maintenant {totalAmount}',
  },
  multipleInstallmentsSameAmount: {
    id: 'payment-plan-strings.multiple-installments-same-amount',
    defaultMessage: '{installmentsCount} x {totalAmount}',
  },
  multipleInstallments: {
    id: 'payment-plan-strings.multiple-installments',
    defaultMessage:
      '{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}}}',
  },
})
