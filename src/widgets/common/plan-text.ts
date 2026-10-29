import { isP1X, isPayLater } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { planStringsMessages } from '@/widgets/common/plan.messages'

// Also replaces master's paymentPlanShorthandText, which gives the same text.
export const paymentPlanShorthandName = (
  plan: EligibilityPlanToDisplay,
  intl: IntlShape,
): string => {
  const {
    deferred_days: deferredDays,
    deferred_months: deferredMonths,
    installments_count: installmentsCount,
  } = plan

  if (isP1X(plan)) {
    return intl.formatMessage(planStringsMessages.payNowButton)
  }
  if (installmentsCount === 1 && deferredDays) {
    return intl.formatMessage(planStringsMessages.dayAbbreviation, {
      deferredDays: `+${deferredDays}`,
    })
  }
  if (installmentsCount === 1 && deferredMonths) {
    return intl.formatMessage(planStringsMessages.monthAbbreviation, {
      deferredMonths: `+${deferredMonths}`,
    })
  }
  return `${installmentsCount}x`
}

export const getPlanDescription = (plan: EligibilityPlanToDisplay, intl: IntlShape): string => {
  if (isP1X(plan)) {
    return intl.formatMessage(planStringsMessages.payNowButton)
  }
  if (isPayLater(plan)) {
    return intl.formatMessage(planStringsMessages.payDeferredButton, {
      deferredTime:
        plan.deferred_months > 0
          ? intl.formatMessage(planStringsMessages.deferredMonths, {
              months: plan.deferred_months,
            })
          : intl.formatMessage(planStringsMessages.deferredDays, { days: plan.deferred_days }),
    })
  }

  return `${plan.installments_count}x`
}
