import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import { repeat } from 'lit/directives/repeat.js'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { almaLogoTemplate } from '@/shared/ui/icons/alma-logo.template'
import { planSectionMessages } from '@/widgets/common/plan.messages'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/payment-plans/payment-plans.const'
import { paymentPlansMessages } from '@/widgets/payment-plans/payment-plans.messages'
import { loaderTemplate } from '@/widgets/payment-plans/templates/loader.template'
import styles from '@/widgets/payment-plans/templates/payment-plans.module.css'
import { planButtonTemplate } from '@/widgets/payment-plans/templates/plan-button.template'

type OpenEvent = MouseEvent | KeyboardEvent

const isEnterOrSpace = (event: KeyboardEvent) => event.key === 'Enter' || event.key === ' '

// No ID, no alma-* class, no hideBorder and no alert region, as on master.
export const plansLoadingTemplate = (): TemplateResult => {
  const classes = classMap({ [styles.widgetContainer]: true, [styles.pending]: true })
  return html`<div class=${classes}>${loaderTemplate()}</div>`
}

export interface PlansContentParams {
  plans: EligibilityPlanToDisplay[]
  current: number
  monochrome?: boolean
  hideBorder?: boolean
  // The info line is a button that opens the modal.
  isInfoClickable: boolean
  info: TemplateResult | typeof nothing
  announceText: string
  // The know-more button, and the info line when clickable.
  onOpenModal: (event: OpenEvent) => void
  onPlanHover: (index: number) => void
  onPlanLeave: () => void
  onPlanKeyDown: (event: KeyboardEvent, index: number) => void
  onPlanClick: (event: MouseEvent, index: number) => void
}

const knowMoreTemplate = (
  { monochrome, onOpenModal }: PlansContentParams,
  intl: IntlShape,
): TemplateResult => {
  const classes = classMap({
    [styles.knowMore]: true,
    [styles.clickable]: true,
    [styles.monochrome]: !!monochrome,
    [STATIC_CUSTOMISATION_CLASSES.knowMoreAction]: true,
  })
  const onKeyDown = (event: KeyboardEvent) => {
    if (isEnterOrSpace(event)) {
      event.preventDefault()
      onOpenModal(event)
    }
  }
  return html`<button
    type="button"
    class=${classes}
    aria-label=${intl.formatMessage(paymentPlansMessages.openButtonAriaLabel)}
    aria-haspopup="dialog"
    aria-describedby="payment-info-text"
    @click=${onOpenModal}
    @keydown=${onKeyDown}
  >
    ${almaLogoTemplate({
      testId: 'Alma-Logo',
      className: styles.logo,
      color: monochrome ? 'var(--off-black)' : undefined,
    })}
  </button>`
}

const plansTemplate = (params: PlansContentParams, intl: IntlShape): TemplateResult => {
  const { plans, current, monochrome, onPlanHover, onPlanLeave, onPlanKeyDown, onPlanClick } =
    params
  const classes = classMap({
    [styles.paymentPlans]: true,
    [STATIC_CUSTOMISATION_CLASSES.eligibilityOptions]: true,
  })
  // Keyed as on master, so a button follows its plan when the list changes.
  return html`<div
    class=${classes}
    role="listbox"
    aria-label=${intl.formatMessage(paymentPlansMessages.listboxAriaLabel)}
  >
    ${repeat(
      plans,
      (plan) => `p${plan.installments_count}x-d+${plan.deferred_days}-m+${plan.deferred_months}`,
      (plan, index) =>
        planButtonTemplate(
          {
            plan,
            isCurrent: index === current,
            monochrome,
            onHover: () => onPlanHover(index),
            onLeave: onPlanLeave,
            onKeyDown: (event) => onPlanKeyDown(event, index),
            onClick: (event) => onPlanClick(event, index),
          },
          intl,
        ),
    )}
  </div>`
}

const infoTemplate = (
  { plans, current, isInfoClickable, info, onOpenModal }: PlansContentParams,
  intl: IntlShape,
): TemplateResult => {
  const notEligible = !plans[current]?.eligible
  const classes = classMap({
    [styles.info]: true,
    [styles.notEligible]: notEligible,
    [STATIC_CUSTOMISATION_CLASSES.notEligibleOption]: notEligible,
    [styles.clickable]: isInfoClickable,
    [STATIC_CUSTOMISATION_CLASSES.paymentInfo]: true,
  })
  const onKeyDown = (event: KeyboardEvent) => {
    if (isEnterOrSpace(event)) {
      onOpenModal(event)
    }
  }
  const title = intl.formatMessage(paymentPlansMessages.paymentInfoSectionTitle)
  // No whitespace around the info, which Prettier would add: master's textContent has none.
  // prettier-ignore
  const infoLine = html`<div
    class=${classes}
    id="payment-info-text"
    role=${ifDefined(isInfoClickable ? 'button' : undefined)}
    tabindex=${ifDefined(isInfoClickable ? '0' : undefined)}
    aria-haspopup=${ifDefined(isInfoClickable ? 'dialog' : undefined)}
    @click=${isInfoClickable ? onOpenModal : nothing}
    @keydown=${isInfoClickable ? onKeyDown : nothing}
  >${info}</div>`
  return html`<div role="region" aria-labelledby="payment-info-title" class=${styles.infoContainer}>
    <div id="payment-info-title" class="sr-only" role="heading" aria-level="2">${title}</div>
    ${infoLine}
  </div>`
}

// On one line, so the region holds no whitespace between announcements.
const announcementTemplate = (text: string) =>
  html`<div role="alert" aria-live="assertive" class=${styles.announceText}>${text}</div>`

// What master's PaymentPlanWidget renders once the request succeeds with plans to show.
export const plansContentTemplate = (
  params: PlansContentParams,
  intl: IntlShape,
): TemplateResult => {
  const { monochrome, hideBorder, announceText } = params
  const rootClasses = classMap({
    [styles.widgetContainer]: true,
    [styles.hideBorder]: !!hideBorder,
    [styles.monochrome]: !!monochrome,
    [STATIC_CUSTOMISATION_CLASSES.container]: true,
  })
  const lineClasses = classMap({
    [styles.primaryContainer]: true,
    [STATIC_CUSTOMISATION_CLASSES.eligibilityLine]: true,
  })
  const title = intl.formatMessage(planSectionMessages.sectionTitle)
  const widget = html`<div
    id="alma-widget-payment-plans-main-container"
    class=${rootClasses}
    data-testid="widget-container"
  >
    <div role="region" aria-labelledby="payment-plans-title" class=${lineClasses}>
      <div id="payment-plans-title" class="sr-only" role="heading" aria-level="2">${title}</div>
      ${knowMoreTemplate(params, intl)}${plansTemplate(params, intl)}
    </div>
    ${infoTemplate(params, intl)}
  </div>`
  // One literal for both would put a text node between them, which master lacks.
  return html`${widget}${announcementTemplate(announceText)}`
}
