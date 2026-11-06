import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import { isCredit, isPayLater } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import {
  getCreditDurationInMonths,
  getCustomerFees,
  getCustomerLendingRate,
  getFinancedAmount,
  getInitialDeposit,
  getTotalCreditCost,
  getTotalPurchaseAmount,
} from '@/domain/plans/regulatory-figures'
import type { IntlShape, MessageDescriptor } from '@/shared/i18n/i18n.types'
import { secondsToMilliseconds } from '@/shared/lib/date'
import { priceFromCents } from '@/shared/lib/price'
import { formatRichText, type RichText } from '@/shared/ui/rich-text'
import { planStringsMessages } from '@/widgets/common/plan.messages'
import { legalMentionsMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/schedule/legal-mentions.module.css'

export interface LegalMentionsParams {
  currentPlan: EligibilityPlanToDisplay
  intl: IntlShape
}

interface LegalMention {
  message: MessageDescriptor
  values: Record<string, string | number | RichText>
}

const link = (chunks: RichText) =>
  html`<a
    href="https://almapay.com"
    target="_blank"
    rel="noopener noreferrer"
    class=${classMap({ [styles.disclaimerLink]: true })}
    >${chunks}</a
  >`

const mail = (chunks: RichText) =>
  html`<a href="mailto:support@almapay.com" class=${classMap({ [styles.disclaimerLink]: true })}
    >${chunks}</a
  >`

const disclaimer = (currentPlan: EligibilityPlanToDisplay, intl: IntlShape): RichText => {
  const isFrenchTransaction = currentPlan.transaction_country?.toUpperCase() === 'FR'
  const almaDisclaimer = formatRichText(intl, legalMentionsMessages.disclaimer, {
    // Alma is a financing company in France and a payment institution everywhere else.
    status: intl.formatMessage(
      isFrenchTransaction
        ? legalMentionsMessages.financingCompany
        : legalMentionsMessages.paymentInstitution,
    ),
    link,
    mail,
  })

  // In France, a plan that costs the customer nothing must say the merchant pays for the credit.
  if (!isFrenchTransaction || getTotalCreditCost(currentPlan) !== 0) {
    return almaDisclaimer
  }
  return [intl.formatMessage(legalMentionsMessages.creditCostBorneByMerchant), ' ', almaDisclaimer]
}

const legalMention = (currentPlan: EligibilityPlanToDisplay, intl: IntlShape): LegalMention => {
  const formatPrice = (cents: number, options?: Intl.NumberFormatOptions) =>
    intl.formatNumber(priceFromCents(cents), { ...options, style: 'currency', currency: 'EUR' })

  const values = {
    financedAmount: formatPrice(getFinancedAmount(currentPlan)),
    customerLendingRate: intl.formatNumber(getCustomerLendingRate(currentPlan), {
      style: 'percent',
      maximumFractionDigits: 2,
    }),
    purchaseAmount: formatPrice(currentPlan.purchase_amount),
    disclaimer: disclaimer(currentPlan, intl),
  }
  const pnxValues = {
    ...values,
    creditDurationInMonths: getCreditDurationInMonths(currentPlan),
    initialDeposit: formatPrice(getInitialDeposit(currentPlan)),
  }

  if (isCredit(currentPlan)) {
    return { message: legalMentionsMessages.creditOrPnxWithoutFees, values: pnxValues }
  }

  const fees = getCustomerFees(currentPlan)
  const hasFees = fees > 0

  if (isPayLater(currentPlan)) {
    const { deferred_days: deferredDays, deferred_months: deferredMonths } = currentPlan
    const deferredDuration =
      deferredMonths > 0
        ? intl.formatMessage(planStringsMessages.deferredMonths, { months: deferredMonths })
        : intl.formatMessage(planStringsMessages.deferredDays, { days: deferredDays })
    const payLaterValues = {
      ...values,
      deferredDuration,
      totalDue: formatPrice(getTotalPurchaseAmount(currentPlan), {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      dueDate: intl.formatDate(
        secondsToMilliseconds(currentPlan.payment_plan?.[0]?.due_date ?? 0),
        { day: 'numeric', month: 'long', year: 'numeric' },
      ),
    }
    return hasFees
      ? {
          message: legalMentionsMessages.payLaterWithFees,
          values: { ...payLaterValues, fees: formatPrice(fees) },
        }
      : { message: legalMentionsMessages.payLaterWithoutFees, values: payLaterValues }
  }

  return hasFees
    ? {
        message: legalMentionsMessages.pnxWithFees,
        values: { ...pnxValues, fees: formatPrice(fees) },
      }
    : { message: legalMentionsMessages.creditOrPnxWithoutFees, values: pnxValues }
}

export const legalMentionsTemplate = ({
  currentPlan,
  intl,
}: LegalMentionsParams): TemplateResult => {
  const { message, values } = legalMention(currentPlan, intl)
  const text = formatRichText(intl, message, values)
  const classes = classMap({ [styles.legalMentions]: true })
  return html`<div class=${classes} data-testid="legal-mentions">${text}</div>`
}
