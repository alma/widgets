import React, { ReactNode } from 'react'

import { secondsToMilliseconds } from 'date-fns'
import { FormattedDate, FormattedMessage, FormattedNumber } from 'react-intl'

import { EligibilityPlan, EligibilityPlanToDisplay } from '@/types'
import { isP1X, priceFromCents } from '@/utils'
import s from '@/utils/paymentPlanStrings.module.css'

export const paymentPlanShorthandName = (payment: EligibilityPlan): ReactNode => {
  const {
    deferred_days: deferredDays,
    deferred_months: deferredMonths,
    installments_count: installmentsCount,
  } = payment

  if (installmentsCount === 1 && !deferredDays && !deferredMonths) {
    return (
      <FormattedMessage
        id="payment-plan-strings.pay.now.button"
        defaultMessage="Payer maintenant"
      />
    )
  }
  if (installmentsCount === 1 && deferredDays) {
    return (
      <FormattedMessage
        id="payment-plan-strings.day-abbreviation"
        defaultMessage="J{deferredDays}"
        values={{
          deferredDays: `+${deferredDays}`,
        }}
      />
    )
  }
  if (installmentsCount === 1 && deferredMonths) {
    return (
      <FormattedMessage
        id="payment-plan-strings.month-abbreviation"
        defaultMessage="M{deferredMonths}"
        values={{
          deferredMonths: `+${deferredMonths}`,
        }}
      />
    )
  }
  return `${installmentsCount}x`
}

// eslint-disable-next-line consistent-return
const withNoFee = (payment: EligibilityPlanToDisplay) => {
  if (
    payment.payment_plan?.every((plan) => plan.customer_fee === 0 && plan.customer_interest === 0)
  ) {
    return (
      <>
        {' '}
        <FormattedMessage id="payment-plan-strings.no-fee" defaultMessage="(sans frais)" />
      </>
    )
  }
}

export const paymentPlanInfoText = (payment: EligibilityPlanToDisplay): ReactNode => {
  const {
    deferred_days: deferredDays,
    deferred_months: deferredMonths,
    installments_count: installmentsCount,
    eligible,
    purchase_amount: purchaseAmount,
    minAmount = 0,
    maxAmount = 0,
    payment_plan: paymentPlan,
  } = payment
  const deferredDaysCount = deferredDays + deferredMonths * 30

  if (!eligible) {
    return (
      <p>
        {purchaseAmount > maxAmount ? (
          <FormattedMessage
            id="payment-plan-strings.ineligible-greater-than-max"
            defaultMessage="Jusqu'à {maxAmount}"
            values={{
              maxAmount: (
                <FormattedNumber
                  value={priceFromCents(maxAmount)}
                  style="currency"
                  currency="EUR"
                />
              ),
            }}
          />
        ) : (
          <FormattedMessage
            id="payment-plan-strings.ineligible-lower-than-min"
            defaultMessage="À partir de {minAmount}"
            values={{
              minAmount: (
                <FormattedNumber
                  value={priceFromCents(minAmount)}
                  style="currency"
                  currency="EUR"
                />
              ),
            }}
          />
        )}
      </p>
    )
  }
  if (!paymentPlan) {
    /* This error should never happen. We added this condition to avoid a typescript warning on
         payment_plan possibly undefined. As far as we know, it only happens when the plan is not
         eligible, which is checked above. */
    throw Error(
      `No payment plan provided for payment in ${installmentsCount} installments. Please contact us if you see this error.`,
    )
  } else if (deferredDaysCount !== 0 && installmentsCount === 1) {
    return (
      <p>
        <FormattedMessage
          id="payment-plan-strings.deferred"
          defaultMessage="{totalAmount} à payer le {dueDate}"
          values={{
            totalAmount: (
              <FormattedNumber
                value={priceFromCents(paymentPlan[0].total_amount)}
                style="currency"
                currency="EUR"
              />
            ),
            dueDate: (
              <FormattedDate
                value={secondsToMilliseconds(paymentPlan[0].due_date)}
                day="numeric"
                month="long"
                year="numeric"
              />
            ),
          }}
        />
        {withNoFee(payment)}
      </p>
    )
  } else if (installmentsCount > 0) {
    const areInstallmentsOfSameAmount = paymentPlan?.every(
      (installment, index) =>
        index === 0 || installment.total_amount === paymentPlan[0].total_amount,
    )

    if (installmentsCount > 4) {
      return (
        <p className={s.openModalInfo}>
          <FormattedMessage
            id="payment-plan-strings.credit"
            defaultMessage="Cliquez pour en savoir plus"
            description="Link to credit details"
          />
        </p>
      )
    }

    if (isP1X(payment)) {
      return (
        <p>
          <FormattedMessage
            id="payment-plan-strings.pay-now"
            defaultMessage="Payer maintenant {totalAmount}"
            values={{
              totalAmount: (
                <FormattedNumber
                  value={priceFromCents(paymentPlan[0].total_amount)}
                  style="currency"
                  currency="EUR"
                />
              ),
              installmentsCount,
            }}
          />
          {withNoFee(payment)}
        </p>
      )
    }

    if (areInstallmentsOfSameAmount) {
      return (
        <p>
          <FormattedMessage
            id="payment-plan-strings.multiple-installments-same-amount"
            defaultMessage="{installmentsCount} x {totalAmount}"
            values={{
              totalAmount: (
                <FormattedNumber
                  value={priceFromCents(paymentPlan[0].total_amount)}
                  style="currency"
                  currency="EUR"
                />
              ),
              installmentsCount,
            }}
          />
          {withNoFee(payment)}
        </p>
      )
    }

    return (
      <p>
        <FormattedMessage
          id="payment-plan-strings.multiple-installments"
          defaultMessage="{numberOfRemainingInstallments, plural, one {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}} other {{firstInstallmentAmount} puis {numberOfRemainingInstallments} x {othersInstallmentAmount}}}"
          values={{
            firstInstallmentAmount: (
              <FormattedNumber
                value={priceFromCents(paymentPlan[0].total_amount)}
                style="currency"
                currency="EUR"
              />
            ),
            numberOfRemainingInstallments: installmentsCount - 1,
            othersInstallmentAmount: (
              <FormattedNumber
                value={priceFromCents(paymentPlan[1].total_amount)}
                style="currency"
                currency="EUR"
              />
            ),
          }}
        />
        {withNoFee(payment)}
      </p>
    )
  }
  return (
    <p>
      <FormattedMessage
        id="payment-plan-strings.default-message"
        defaultMessage="Payez en plusieurs fois avec Alma"
      />
    </p>
  )
}
