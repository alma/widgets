import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import { StatusResponse } from '@/domain/api/eligibility.const'
import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { isP1X } from '@/domain/utils/plan-kind'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import type { Card } from '@/shared/templates/card-logos/cards.types'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator/loading-indicator.template'
import { modalContentMessages } from '@/widgets/eligibility-modal/templates/modal-content.messages'
import styles from '@/widgets/eligibility-modal/templates/modal-content.module.css'
import { modalLayoutTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/modal-layout.template'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell/modal-shell.template'
import {
  type PlanTabsParams,
  planTabsTemplate,
} from '@/widgets/eligibility-modal/templates/plan-tabs/plan-tabs.template'
import { scheduleTemplate } from '@/widgets/eligibility-modal/templates/schedule/schedule.template'
import {
  type SkipLink,
  skipLinksTemplate,
} from '@/widgets/eligibility-modal/templates/skip-links/skip-links.template'

export interface ModalContentParams {
  eligiblePlans: EligibilityPlanToDisplay[]
  // Over every plan the modal received, eligible or not.
  isSomePlanDeferred: boolean
  status: StatusResponse
  // Among the eligible plans.
  currentPlanIndex: number
  setCurrentPlanIndex: PlanTabsParams['setCurrentPlanIndex']
  // Whether desktopMediaQuery matches.
  isBigScreen: boolean
  cards?: Card[]
  onClose: (event: MouseEvent) => void
  intl: IntlShape
}

type StatusContentParams = Pick<
  ModalContentParams,
  'status' | 'eligiblePlans' | 'currentPlanIndex' | 'setCurrentPlanIndex' | 'intl'
>

const skipLinksOf = (intl: IntlShape): SkipLink[] =>
  [
    { href: '#payment-plans', message: modalContentMessages.skipToPaymentPlans },
    { href: '#payment-info', message: modalContentMessages.skipToPaymentInfo },
    { href: '#payment-schedule', message: modalContentMessages.skipToPaymentSchedule },
  ].map(({ href, message }) => ({
    href,
    labelId: message.id,
    // Master passes the formatted text as the default message.
    defaultMessage: intl.formatMessage(message),
  }))

const statusContentTemplate = ({
  status,
  eligiblePlans,
  currentPlanIndex,
  setCurrentPlanIndex,
  intl,
}: StatusContentParams) => {
  if (status === StatusResponse.PENDING) {
    return html`<div class=${classMap({ [styles.loader]: true })} role="status" aria-live="polite">
      ${loadingIndicatorTemplate()}
    </div>`
  }
  if (status !== StatusResponse.SUCCESS) {
    return nothing
  }
  if (eligiblePlans.length === 0) {
    const noEligibilityClasses = classMap({ [styles.noEligibility]: true })
    const text = intl.formatMessage(modalContentMessages.noEligibility)
    return html`<div class=${noEligibilityClasses} role="alert">${text}</div>`
  }
  const scheduleAreaClasses = classMap({ [styles.scheduleArea]: true })
  return html`<div role="region" aria-labelledby="payment-plans-title">
      ${planTabsTemplate({
        id: 'payment-plans',
        eligibilityPlans: eligiblePlans,
        currentPlanIndex,
        setCurrentPlanIndex,
        intl,
      })}
    </div>
    <div class=${scheduleAreaClasses} role="region" aria-labelledby="payment-schedule-title">
      <div class=${classMap({ [styles.verticalLine]: true })}></div>
      ${scheduleTemplate({ id: 'payment-schedule', currentPlan: eligiblePlans[currentPlanIndex], intl })}
    </div>`
}

// What master's EligibilityModal renders inside react-modal's content div.
export const modalContentTemplate = ({
  eligiblePlans,
  isSomePlanDeferred,
  status,
  currentPlanIndex,
  setCurrentPlanIndex,
  isBigScreen,
  cards,
  onClose,
  intl,
}: ModalContentParams): TemplateResult => {
  // Master crashes on an index out of range, because the schedule reads a missing plan.
  const planIndex = currentPlanIndex < eligiblePlans.length ? currentPlanIndex : 0
  const currentPlan = eligiblePlans[planIndex] as EligibilityPlanToDisplay | undefined
  const layout = modalLayoutTemplate({
    isBigScreen,
    isSomePlanDeferred,
    cards,
    isCurrentPlanP1X: currentPlan ? isP1X(currentPlan) : false,
    children: statusContentTemplate({
      status,
      eligiblePlans,
      currentPlanIndex: planIndex,
      setCurrentPlanIndex,
      intl,
    }),
    intl,
  })
  return modalShellTemplate({
    onClose,
    scrollable: true,
    children: html`${skipLinksTemplate({ skipLinks: skipLinksOf(intl), intl })}${layout}`,
    intl,
  })
}
