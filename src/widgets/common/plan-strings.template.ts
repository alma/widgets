import { html, nothing, type TemplateResult } from 'lit'

import type { PaymentPlan } from '@/domain/plans/api/eligibility.types'
import { isCredit, isP1X, requiresLegalDisclosure } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { secondsToMilliseconds } from '@/shared/lib/date'
import { priceFromCents } from '@/shared/lib/price'
import { formatRichText, type RichText } from '@/shared/ui/rich-text'
import styles from '@/widgets/common/plan-strings.module.css'
import { planStringsMessages } from '@/widgets/common/plan.messages'

// Euros whatever the locale, as on master. A template, so the amount gets its own text node, like
// master's <FormattedNumber>.
const eurosTemplate = (intl: IntlShape, cents: number) =>
  html`${intl.formatNumber(priceFromCents(cents), { style: 'currency', currency: 'EUR' })}`

const dueDateTemplate = (intl: IntlShape, dueDate: number) =>
  html`${intl.formatDate(secondsToMilliseconds(dueDate), {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })}`

// Master's {' '} and <FormattedMessage>: two text nodes.
const noFeeTemplate = (paymentPlan: PaymentPlan[], intl: IntlShape) =>
  paymentPlan.every(
    (installment) => installment.customer_fee === 0 && installment.customer_interest === 0,
  )
    ? html`${' '}${intl.formatMessage(planStringsMessages.noFee)}`
    : nothing

const lineTemplate = (text: RichText, noFee: TemplateResult | typeof nothing = nothing) =>
  html`<p>${text}${noFee}</p>`

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
        ? formatRichText(intl, planStringsMessages.ineligibleGreaterThanMax, {
            maxAmount: eurosTemplate(intl, maxAmount),
          })
        : formatRichText(intl, planStringsMessages.ineligibleLowerThanMin, {
            minAmount: eurosTemplate(intl, minAmount),
          })
    return lineTemplate(text)
  }
  if (!paymentPlan) {
    // Never happens: the API sends payment_plan with every eligible plan.
    throw Error(
      `No payment plan provided for payment in ${installmentsCount} installments. Please contact us if you see this error.`,
    )
  }

  const noFee = noFeeTemplate(paymentPlan, intl)

  if (deferredDaysCount !== 0 && installmentsCount === 1) {
    const text = formatRichText(intl, planStringsMessages.deferred, {
      totalAmount: eurosTemplate(intl, paymentPlan[0].total_amount),
      dueDate: dueDateTemplate(intl, paymentPlan[0].due_date),
    })
    return withKnowMoreTemplate(lineTemplate(text, noFee), plan, intl)
  }

  if (isP1X(plan)) {
    const text = formatRichText(intl, planStringsMessages.payNow, {
      totalAmount: eurosTemplate(intl, paymentPlan[0].total_amount),
    })
    return lineTemplate(text, noFee)
  }

  if (isCredit(plan)) {
    return html`${knowMoreTemplate(plan, intl)}`
  }

  const areInstallmentsOfSameAmount = paymentPlan.every(
    (installment, index) => index === 0 || installment.total_amount === paymentPlan[0].total_amount,
  )

  const text = areInstallmentsOfSameAmount
    ? formatRichText(intl, planStringsMessages.multipleInstallmentsSameAmount, {
        totalAmount: eurosTemplate(intl, paymentPlan[0].total_amount),
        installmentsCount,
      })
    : formatRichText(intl, planStringsMessages.multipleInstallments, {
        firstInstallmentAmount: eurosTemplate(intl, paymentPlan[0].total_amount),
        numberOfRemainingInstallments: installmentsCount - 1,
        othersInstallmentAmount: eurosTemplate(intl, paymentPlan[1].total_amount),
      })
  return withKnowMoreTemplate(lineTemplate(text, noFee), plan, intl)
}
