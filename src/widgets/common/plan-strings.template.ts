import { html, nothing, type TemplateResult } from 'lit'

import type { PaymentPlan } from '@/domain/plans/api/eligibility.types'
import { isCredit, isP1X, requiresLegalDisclosure } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { secondsToMilliseconds } from '@/shared/lib/date'
import { priceFromCents } from '@/shared/lib/price'
import styles from '@/widgets/common/plan-strings.module.css'
import { planStringsMessages } from '@/widgets/common/plan.messages'

// Euros whatever the locale, as on master.
const formatEuros = (intl: IntlShape, cents: number) =>
  intl.formatNumber(priceFromCents(cents), { style: 'currency', currency: 'EUR' })

const formatDueDate = (intl: IntlShape, dueDate: number) =>
  intl.formatDate(secondsToMilliseconds(dueDate), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

const noFeeText = (paymentPlan: PaymentPlan[], intl: IntlShape) =>
  paymentPlan.every(
    (installment) => installment.customer_fee === 0 && installment.customer_interest === 0,
  )
    ? ` ${intl.formatMessage(planStringsMessages.noFee)}`
    : ''

const lineTemplate = (text: string) => html`<p>${text}</p>`

// Master also checks `eligible`, which always holds here: ineligible plans return before.
const knowMoreTemplate = (plan: EligibilityPlanToDisplay, intl: IntlShape) =>
  requiresLegalDisclosure(plan)
    ? html`<p class=${styles.openModalInfo}>${intl.formatMessage(planStringsMessages.credit)}</p>`
    : nothing

// Not one literal with both <p>: Prettier would put a newline between them, which master lacks.
const withKnowMoreTemplate = (
  line: TemplateResult,
  plan: EligibilityPlanToDisplay,
  intl: IntlShape,
) => html`${line}${knowMoreTemplate(plan, intl)}`

export interface PaymentPlanInfoTextParams {
  plan: EligibilityPlanToDisplay
  intl: IntlShape
}

export const paymentPlanInfoTextTemplate = ({
  plan,
  intl,
}: PaymentPlanInfoTextParams): TemplateResult => {
  const {
    deferred_days: deferredDays,
    deferred_months: deferredMonths,
    installments_count: installmentsCount,
    eligible,
    purchase_amount: purchaseAmount,
    minAmount = 0,
    maxAmount = 0,
    payment_plan: paymentPlan,
  } = plan
  const deferredDaysCount = deferredDays + deferredMonths * 30

  if (!eligible) {
    const text =
      purchaseAmount > maxAmount
        ? intl.formatMessage(planStringsMessages.ineligibleGreaterThanMax, {
            maxAmount: formatEuros(intl, maxAmount),
          })
        : intl.formatMessage(planStringsMessages.ineligibleLowerThanMin, {
            minAmount: formatEuros(intl, minAmount),
          })
    return lineTemplate(text)
  }
  if (!paymentPlan) {
    // Never happens: the API sends payment_plan with every eligible plan.
    throw Error(
      `No payment plan provided for payment in ${installmentsCount} installments. Please contact us if you see this error.`,
    )
  }

  const noFee = noFeeText(paymentPlan, intl)

  if (deferredDaysCount !== 0 && installmentsCount === 1) {
    const text = intl.formatMessage(planStringsMessages.deferred, {
      totalAmount: formatEuros(intl, paymentPlan[0].total_amount),
      dueDate: formatDueDate(intl, paymentPlan[0].due_date),
    })
    return withKnowMoreTemplate(lineTemplate(`${text}${noFee}`), plan, intl)
  }

  if (isP1X(plan)) {
    const text = intl.formatMessage(planStringsMessages.payNow, {
      totalAmount: formatEuros(intl, paymentPlan[0].total_amount),
    })
    return lineTemplate(`${text}${noFee}`)
  }

  if (isCredit(plan)) {
    return html`${knowMoreTemplate(plan, intl)}`
  }

  const areInstallmentsOfSameAmount = paymentPlan.every(
    (installment, index) => index === 0 || installment.total_amount === paymentPlan[0].total_amount,
  )

  const text = areInstallmentsOfSameAmount
    ? intl.formatMessage(planStringsMessages.multipleInstallmentsSameAmount, {
        totalAmount: formatEuros(intl, paymentPlan[0].total_amount),
        installmentsCount,
      })
    : intl.formatMessage(planStringsMessages.multipleInstallments, {
        firstInstallmentAmount: formatEuros(intl, paymentPlan[0].total_amount),
        numberOfRemainingInstallments: installmentsCount - 1,
        othersInstallmentAmount: formatEuros(intl, paymentPlan[1].total_amount),
      })
  return withKnowMoreTemplate(lineTemplate(`${text}${noFee}`), plan, intl)
}
