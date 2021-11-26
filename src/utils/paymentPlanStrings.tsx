import { secondsToMilliseconds } from 'date-fns'
import React, { ReactNode } from 'react'
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl'
import { EligibilityPlan, EligibilityPlanToDisplay } from 'types'
import { priceFromCents } from 'utils'

export const paymentPlanShorthandName = (payment: EligibilityPlan): ReactNode => {
  const { deferred_days, deferred_months, installments_count: installmentsCount } = payment
  const deferredDaysCount = deferred_days + deferred_months * 30

  if (installmentsCount === 1) {
    return (
      <FormattedMessage
        id="payment-plan-strings.day-abbreviation"
        defaultMessage="J{numberOfDeferredDays}"
        values={{
          numberOfDeferredDays: deferredDaysCount > 0 ? `+${deferredDaysCount}` : '',
        }}
      />
    )
  } else {
    return `${installmentsCount}x`
  }
}

export const paymentPlanInfoText = (payment: EligibilityPlanToDisplay): ReactNode => {
  const {
    deferred_days,
    deferred_months,
    installments_count: installmentsCount,
    eligible,
    purchase_amount: purchaseAmount,
    minAmount = 0,
    maxAmount = 0,
  } = payment
  const deferredDaysCount = deferred_days + deferred_months * 30

  if (!eligible) {
    return purchaseAmount > maxAmount ? (
      <FormattedMessage
        id="payment-plan-strings.ineligible-greater-than-max"
        defaultMessage="Jusqu'à {maxAmount}"
        values={{
          maxAmount: (
            <FormattedNumber value={priceFromCents(maxAmount)} style="currency" currency="EUR" />
          ),
        }}
      />
    ) : (
      <FormattedMessage
        id="payment-plan-strings.ineligible-lower-than-min"
        defaultMessage="À partir de {minAmount}"
        values={{
          minAmount: (
            <FormattedNumber value={priceFromCents(minAmount)} style="currency" currency="EUR" />
          ),
        }}
      />
    )
  } else if (deferredDaysCount !== 0 && installmentsCount === 1) {
    return (
      <FormattedMessage
        id="payment-plan-strings.deferred"
        defaultMessage="{totalAmount} à payer le {dueDate}"
        values={{
          totalAmount: (
            <FormattedNumber
              value={priceFromCents(payment.payment_plan[0].total_amount)}
              style="currency"
              currency="EUR"
            />
          ),
          dueDate: (
            <FormattedDate
              value={secondsToMilliseconds(payment.payment_plan[0].due_date)}
              day="numeric"
              month="long"
              year="numeric"
            />
          ),
        }}
      />
    )
  } else if (installmentsCount > 0) {
    return (
      <FormattedMessage
        id="payment-plan-strings.multiple-installments"
        defaultMessage="{firstInstallmentAmount} puis {numberOfRemainingInstallments} mensualités de {othersInstallmentAmount}"
        values={{
          firstInstallmentAmount: (
            <FormattedNumber
              value={priceFromCents(payment.payment_plan[0].total_amount)}
              style="currency"
              currency="EUR"
            />
          ),
          numberOfRemainingInstallments: installmentsCount - 1,
          othersInstallmentAmount: (
            <FormattedNumber
              value={priceFromCents(payment.payment_plan[1].total_amount)}
              style="currency"
              currency="EUR"
            />
          ),
        }}
      />
    )
  }
  return (
    <FormattedMessage
      id="payment-plan-strings.default-message"
      defaultMessage="Payez en plusieurs fois avec Alma"
    />
  )
}
