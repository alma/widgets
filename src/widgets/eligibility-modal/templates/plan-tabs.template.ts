import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { paymentPlanShorthandName } from '@/widgets/common/plan-text'
import { planSectionMessages } from '@/widgets/common/plan.messages'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { planTabsMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/plan-tabs.module.css'

export interface PlanTabsParams {
  eligibilityPlans: EligibilityPlanToDisplay[]
  currentPlanIndex: number
  // An async host returns `updateComplete`, so focus moves after the render. Must not reject.
  setCurrentPlanIndex: (index: number) => void | Promise<unknown>
  id?: string
  intl: IntlShape
}

const keyTargets: Record<string, (index: number, count: number) => number> = {
  ArrowLeft: (index) => index - 1,
  ArrowRight: (index) => index + 1,
  Home: () => 0,
  End: (_index, count) => count - 1,
}

export const planTabsTemplate = ({
  eligibilityPlans,
  currentPlanIndex,
  setCurrentPlanIndex,
  id,
  intl,
}: PlanTabsParams): TemplateResult => {
  const handleKeyDown = async (event: KeyboardEvent, index: number) => {
    const target = keyTargets[event.key]
    if (!target) {
      return
    }
    event.preventDefault()
    const newIndex = target(index, eligibilityPlans.length)
    if (newIndex < 0 || newIndex >= eligibilityPlans.length) {
      return
    }
    const group = (event.currentTarget as HTMLElement).parentElement
    await setCurrentPlanIndex(newIndex)
    // Master moves focus from an effect on the index, which doesn't run when the index stays.
    if (newIndex !== currentPlanIndex) {
      group?.querySelectorAll('button')[newIndex]?.focus()
    }
  }

  const planButtonTemplate = (plan: EligibilityPlanToDisplay, index: number) => {
    const isActive = index === currentPlanIndex
    const name = paymentPlanShorthandName(plan, intl)
    const ariaLabel = intl.formatMessage(planTabsMessages.planButtonAriaLabel, { planName: name })
    // Master renders no class attribute on an inactive button.
    const classes = isActive
      ? classMap({ [styles.active]: true, [STATIC_CUSTOMISATION_CLASSES.activeOption]: true })
      : nothing
    return html`<button
      type="button"
      class=${classes}
      @click=${() => setCurrentPlanIndex(index)}
      @keydown=${(event: KeyboardEvent) => handleKeyDown(event, index)}
      aria-pressed=${isActive ? 'true' : 'false'}
      aria-describedby="payment-info"
      aria-current=${ifDefined(isActive ? 'true' : undefined)}
      aria-label=${ariaLabel}
    >
      <span class=${classMap({ [styles.textButton]: true })}>${name}</span>
    </button>`
  }

  const groupClasses = classMap({
    [styles.buttons]: true,
    [STATIC_CUSTOMISATION_CLASSES.eligibilityOptions]: true,
  })
  const title = intl.formatMessage(planSectionMessages.sectionTitle)
  return html`<div>
    <div id="payment-plans-title" class="sr-only" role="heading" aria-level="2">${title}</div>
    <div
      id=${ifDefined(id)}
      class=${groupClasses}
      role="group"
      aria-labelledby="payment-plans-title"
    >
      ${repeat(
        eligibilityPlans,
        (plan) => `p${plan.installments_count}x-d+${plan.deferred_days}-m+${plan.deferred_months}`,
        planButtonTemplate,
      )}
    </div>
  </div>`
}
