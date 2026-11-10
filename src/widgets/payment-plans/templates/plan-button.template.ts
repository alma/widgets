import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { getPlanDescription, paymentPlanShorthandName } from '@/widgets/common/plan-text'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/payment-plans/payment-plans.const'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'
import styles from '@/widgets/payment-plans/templates/payment-plans.module.css'

export interface PlanButtonParams {
  plan: EligibilityPlanToDisplay
  isCurrent: boolean
  monochrome?: boolean
  // Mouse enter, touch start, and focus of an eligible plan.
  onHover: () => void
  // Mouse leave, blur and touch end.
  onLeave: () => void
  onKeyDown: (event: KeyboardEvent) => void
  onClick: (event: MouseEvent) => void
}

export const planButtonTemplate = (
  { plan, isCurrent, monochrome, onHover, onLeave, onKeyDown, onClick }: PlanButtonParams,
  intl: IntlShape,
): TemplateResult => {
  const isEligible = plan.eligible
  const classes = classMap({
    [styles.planButton]: true,
    [styles.active]: isCurrent,
    [STATIC_CUSTOMISATION_CLASSES.activeOption]: isCurrent,
    [styles.monochrome]: !!monochrome && isCurrent,
    [styles.notEligible]: !isEligible,
    [STATIC_CUSTOMISATION_CLASSES.notEligibleOption]: !isEligible,
  })
  const label = intl.formatMessage(paymentPlansMessages.planOptionAriaLabel, {
    planDescription: getPlanDescription(plan, intl),
  })
  const name = paymentPlanShorthandName(plan, intl)
  // No whitespace around the name, which Prettier would add: master's textContent is the name.
  // prettier-ignore
  return html`<button
    type="button"
    class=${classes}
    role="option"
    aria-selected=${isCurrent ? 'true' : 'false'}
    aria-describedby="payment-info-text"
    aria-label=${label}
    aria-disabled=${isEligible ? 'false' : 'true'}
    tabindex=${isEligible ? '0' : '-1'}
    @mouseenter=${onHover}
    @touchstart=${onHover}
    @mouseleave=${onLeave}
    @blur=${onLeave}
    @touchend=${onLeave}
    @focus=${isEligible ? onHover : nothing}
    @keydown=${onKeyDown}
    @click=${onClick}
  >${name}</button>`
}
