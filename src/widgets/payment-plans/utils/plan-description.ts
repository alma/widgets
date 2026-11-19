import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { isP1X, isPayLater } from '@/domain/utils/plan-kind'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { planDescriptionMessages } from '@/widgets/payment-plans/utils/plan-description.messages'

export const getPlanDescription = (plan: EligibilityPlanToDisplay, intl: IntlShape): string => {
  if (isP1X(plan)) {
    return intl.formatMessage(planDescriptionMessages.payNow)
  }
  if (isPayLater(plan)) {
    return intl.formatMessage(planDescriptionMessages.payDeferred, {
      deferredTime:
        plan.deferred_months > 0
          ? intl.formatMessage(planDescriptionMessages.deferredMonths, {
              months: plan.deferred_months,
            })
          : intl.formatMessage(planDescriptionMessages.deferredDays, { days: plan.deferred_days }),
    })
  }

  return `${plan.installments_count}x`
}
