import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { IntlShape, MessageDescriptor } from '@/shared/i18n/i18n.types'
import { formatRichText, type RichText } from '@/shared/ui/rich-text'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { infoMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/info.module.css'

export interface InfoParams {
  isCurrentPlanP1X: boolean
  id?: string
  intl: IntlShape
}

const strong = (chunks: RichText) => html`<strong>${chunks}</strong>`

const bulletTemplate = (number: number, message: MessageDescriptor, intl: IntlShape) => {
  const bulletClasses = classMap({
    [styles.bullet]: true,
    [STATIC_CUSTOMISATION_CLASSES.bullet]: true,
  })
  const text = formatRichText(intl, message, { strong })
  return html`<li class=${classMap({ [styles.listItem]: true })}>
    <div class=${bulletClasses}>${number}</div>
    <div class=${classMap({ [STATIC_CUSTOMISATION_CLASSES.infoMessage]: true })}>${text}</div>
  </li>`
}

export const infoTemplate = ({ isCurrentPlanP1X, id, intl }: InfoParams): TemplateResult => {
  const classes = classMap({ [styles.list]: true, [STATIC_CUSTOMISATION_CLASSES.info]: true })
  const bullets = isCurrentPlanP1X
    ? [infoMessages.p1xBullet1, infoMessages.p1xBullet2, infoMessages.p1xBullet3]
    : [infoMessages.bullet1, infoMessages.bullet2, infoMessages.bullet3]
  const title = intl.formatMessage(infoMessages.infoTitle)
  return html`<div
    id=${ifDefined(id)}
    class=${classes}
    data-testid="modal-info-element"
    role="region"
    aria-labelledby="payment-info-title"
    aria-describedby="payment-info-description"
    tabindex="-1"
  >
    <div id="payment-info-title" class="sr-only" role="heading" aria-level="2">${title}</div>
    <ol class=${classMap({ [styles.listContainer]: true })} id="payment-info-description">
      ${bullets.map((message, index) => bulletTemplate(index + 1, message, intl))}
    </ol>
  </div>`
}
