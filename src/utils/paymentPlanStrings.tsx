import { secondsToMilliseconds } from 'date-fns'
import React, { ReactNode } from 'react'
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl'
import { EligibilityPlan, EligibilityPlanToDisplay } from 'types'
import { isP1X, priceFromCents } from 'utils'

export const paymentPlanShorthandName = (payment: EligibilityPlan): ReactNode => {
  const { deferred_days, deferred_months, installments_count: installmentsCount } = payment

  if (installmentsCount === 1 && !deferred_days && !deferred_months) {
    return (
      <FormattedMessage
        id="payment-plan-strings.pay.now.button"
        defaultMessage="Payer maintenant"
      />
    )
  }
  if (installmentsCount === 1 && deferred_days) {
    return (
      <FormattedMessage
        id="payment-plan-strings.day-abbreviation"
        defaultMessage="J{deferredDays}"
        values={{
          deferredDays: `+${deferred_days}`,
        }}
      />
    )
  }
  if (installmentsCount === 1 && deferred_months) {
    return (
      <FormattedMessage
        id="payment-plan-strings.month-abbreviation"
        defaultMessage="M{deferredMonths}"
        values={{
          deferredMonths: `+${deferred_months}`,
        }}
      />
    )
  } else {
    return `${installmentsCount}x`
  }
}

const withNoFee = (payment: EligibilityPlanToDisplay) => {
  if (
    payment.payment_plan?.every((plan) => plan.customer_fee === 0 && plan.customer_interest === 0)
  ) {
    return (
      <>
        {' '}
        <FormattedMessage id="payment-plan-strings.no-fee" defaultMessage={'(sans frais)'} />
      </>
    )
  }
}

export const paymentPlanInfoText = (payment: EligibilityPlanToDisplay): ReactNode => {
  const {
    deferred_days,
    deferred_months,
    installments_count: installmentsCount,
    eligible,
    purchase_amount: purchaseAmount,
    payment_plan,
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
  } else if (!payment_plan) {
    /* This error should never happen. We added this condition to avoid a typescript warning on
         payment_plan possibly undefined. As far as we know, it only happens when the plan is not
         eligible, which is checked above. */
    throw Error(
      `No payment plan provided for payment in ${installmentsCount} installments. Please contact us if you see this error.`,
    )
  } else if (deferredDaysCount !== 0 && installmentsCount === 1) {
    return (
      <>
        <FormattedMessage
          id="payment-plan-strings.deferred"
          defaultMessage="{totalAmount} à payer le {dueDate}"
          values={{
            totalAmount: (
              <FormattedNumber
                value={priceFromCents(payment_plan[0].total_amount)}
                style="currency"
                currency="EUR"
              />
            ),
            dueDate: (
              <FormattedDate
                value={secondsToMilliseconds(payment_plan[0].due_date)}
                day="numeric"
                month="long"
                year="numeric"
              />
            ),
          }}
        />
        {withNoFee(payment)}
      </>
    )
  } else if (installmentsCount > 0) {
    const areInstallmentsOfSameAmount = payment_plan?.every(
      (installment, index) =>
        index === 0 || installment.total_amount === payment_plan[0].total_amount,
    )

    if (isP1X(payment)) {
      return (
        <>
          <FormattedMessage
            id="payment-plan-strings.pay-now"
            defaultMessage="Payer maintenant {totalAmount}"
            values={{
              totalAmount: (
                <FormattedNumber
                  value={priceFromCents(payment_plan[0].total_amount)}
                  style="currency"
                  currency="EUR"
                />
              ),
              installmentsCount,
            }}
          />
          {withNoFee(payment)}
        </>
      )
    }

    if (areInstallmentsOfSameAmount) {
      return (
        <>
          <FormattedMessage
            id="payment-plan-strings.multiple-installments-same-amount"
            defaultMessage="{installmentsCount} x {totalAmount}"
            values={{
              totalAmount: (
                <FormattedNumber
                  value={priceFromCents(payment_plan[0].total_amount)}
                  style="currency"
                  currency="EUR"
                />
              ),
              installmentsCount,
            }}
          />
          {withNoFee(payment)}
        </>
      )
    }

    return (
      <>
        <FormattedMessage
          id="payment-plan-strings.multiple-installments"
          defaultMessage="{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}}}"
          values={{
            firstInstallmentAmount: (
              <FormattedNumber
                value={priceFromCents(payment_plan[0].total_amount)}
                style="currency"
                currency="EUR"
              />
            ),
            numberOfRemainingInstallments: installmentsCount - 1,
            othersInstallmentAmount: (
              <FormattedNumber
                value={priceFromCents(payment_plan[1].total_amount)}
                style="currency"
                currency="EUR"
              />
            ),
          }}
        />
        {withNoFee(payment)}
      </>
    )
  }
  return (
    <FormattedMessage
      id="payment-plan-strings.default-message"
      defaultMessage="Payez en plusieurs fois avec Alma"
    />
  )
}
