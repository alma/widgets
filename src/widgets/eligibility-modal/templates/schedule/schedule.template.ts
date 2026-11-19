import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { requiresLegalDisclosure } from '@/domain/utils/plan-kind'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { installmentTemplate } from '@/widgets/eligibility-modal/templates/schedule/installment/installment.template'
import { legalMentionsTemplate } from '@/widgets/eligibility-modal/templates/schedule/legal-mentions/legal-mentions.template'
import { scheduleMessages } from '@/widgets/eligibility-modal/templates/schedule/schedule.messages'
import styles from '@/widgets/eligibility-modal/templates/schedule/schedule.module.css'
import { totalBlockTemplate } from '@/widgets/eligibility-modal/templates/schedule/total-block/total-block.template'
import { warningMessageTemplate } from '@/widgets/eligibility-modal/templates/schedule/warning-message/warning-message.template'

export interface ScheduleParams {
  currentPlan: EligibilityPlanToDisplay
  id?: string
  intl: IntlShape
}

export const scheduleTemplate = ({ currentPlan, id, intl }: ScheduleParams): TemplateResult => {
  const withLegalDisclosure = requiresLegalDisclosure(currentPlan)
  const scheduleClasses = classMap({
    [styles.schedule]: true,
    [STATIC_CUSTOMISATION_CLASSES.scheduleDetails]: true,
  })
  const itemClasses = classMap({ [styles.scheduleItem]: true })
  const installments = (currentPlan?.payment_plan || []).map(
    (installment, index) =>
      html`<li class=${itemClasses}>${installmentTemplate({ installment, index, intl })}</li>`,
  )
  const warningClasses = classMap({ [styles.warningContainer]: true })
  const legalMentionsClasses = classMap({ [styles.legalMentionsContainer]: true })
  // An unmapped country still gets this container, empty.
  const warning = withLegalDisclosure
    ? html`<div class=${warningClasses}>${warningMessageTemplate({ currentPlan, intl })}</div>`
    : nothing
  const legalMentions = withLegalDisclosure
    ? html`<div class=${legalMentionsClasses}>${legalMentionsTemplate({ currentPlan, intl })}</div>`
    : nothing
  const containerClasses = classMap({ [styles.scheduleContainer]: true })
  const title = intl.formatMessage(scheduleMessages.scheduleTitle)
  return html`<div
    id=${ifDefined(id)}
    class=${containerClasses}
    role="region"
    aria-labelledby="payment-schedule-title"
    aria-describedby="payment-schedule-description"
    tabindex="-1"
  >
    <div id="payment-schedule-title" class="sr-only" role="heading" aria-level="2">${title}</div>
    <div id="payment-schedule-description">
      <ul class=${scheduleClasses} data-testid="modal-installments-element">
        ${installments}
      </ul>
      ${warning} ${totalBlockTemplate({ currentPlan, intl })} ${legalMentions}
    </div>
  </div>`
}
