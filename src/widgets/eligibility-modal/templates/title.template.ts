import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import type { IntlShape, MessageDescriptor } from '@/shared/i18n/i18n.types'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { titleMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/title.module.css'

export interface TitleParams {
  isSomePlanDeferred: boolean
  isCurrentPlanP1X: boolean
  intl: IntlShape
}

const titleMessage = (
  isSomePlanDeferred: boolean,
  isCurrentPlanP1X: boolean,
): MessageDescriptor => {
  if (isSomePlanDeferred) {
    return titleMessages.deferredPlan
  }
  if (isCurrentPlanP1X) {
    return titleMessages.payNow
  }
  return titleMessages.normal
}

export const titleTemplate = ({
  isSomePlanDeferred,
  isCurrentPlanP1X,
  intl,
}: TitleParams): TemplateResult => {
  const classes = classMap({ [styles.title]: true, [STATIC_CUSTOMISATION_CLASSES.title]: true })
  const title = intl.formatMessage(titleMessage(isSomePlanDeferred, isCurrentPlanP1X))
  // Prettier would wrap the text in whitespace, which master's textContent lacks.
  // prettier-ignore
  return html`<div
    id="modal-title"
    class=${classes}
    data-testid="modal-title-element"
    role="heading"
    aria-level="1"
  >${title}</div>`
}
