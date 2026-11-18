import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { isP1X, isPayLater } from '@/domain/utils/plan-kind'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { planTextMessages } from '@/shared/plan-text/plan-text.messages'

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
    return intl.formatMessage(planTextMessages.payNowButton)
  }
  if (installmentsCount === 1 && deferredDays) {
    return intl.formatMessage(planTextMessages.dayAbbreviation, {
      deferredDays: `+${deferredDays}`,
    })
  }
  if (installmentsCount === 1 && deferredMonths) {
    return intl.formatMessage(planTextMessages.monthAbbreviation, {
      deferredMonths: `+${deferredMonths}`,
    })
  }
  return `${installmentsCount}x`
}

export const getPlanDescription = (plan: EligibilityPlanToDisplay, intl: IntlShape): string => {
  if (isP1X(plan)) {
    return intl.formatMessage(planTextMessages.payNowButton)
  }
  if (isPayLater(plan)) {
    return intl.formatMessage(planTextMessages.payDeferredButton, {
      deferredTime:
        plan.deferred_months > 0
          ? intl.formatMessage(planTextMessages.deferredMonths, {
              months: plan.deferred_months,
            })
          : intl.formatMessage(planTextMessages.deferredDays, { days: plan.deferred_days }),
    })
  }

  return `${plan.installments_count}x`
}
