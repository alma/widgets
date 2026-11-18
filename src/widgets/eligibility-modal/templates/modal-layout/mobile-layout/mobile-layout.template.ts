import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import type { IntlShape } from '@/shared/i18n/i18n.types'
import { almaLogoTemplate } from '@/shared/templates/alma-logo/alma-logo.template'
import type { Card } from '@/shared/templates/card-logos/cards.types'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { cardsTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.template'
import { infoTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/info/info.template'
import styles from '@/widgets/eligibility-modal/templates/modal-layout/mobile-layout/mobile-layout.module.css'
import { titleTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/title/title.template'

export interface MobileLayoutParams {
  isCurrentPlanP1X: boolean
  isSomePlanDeferred: boolean
  cards?: Card[]
  children?: unknown
  intl: IntlShape
}

export const mobileLayoutTemplate = ({
  isCurrentPlanP1X,
  isSomePlanDeferred,
  cards,
  children,
  intl,
}: MobileLayoutParams): TemplateResult => {
  const containerClasses = classMap({
    [styles.container]: true,
    [STATIC_CUSTOMISATION_CLASSES.mobileModal]: true,
  })
  return html`<div
    class=${containerClasses}
    data-testid="modal-container"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    ${titleTemplate({ isSomePlanDeferred, isCurrentPlanP1X, intl })} ${children}
    ${infoTemplate({ id: 'payment-info', isCurrentPlanP1X, intl })}
    ${cards ? cardsTemplate({ cards, intl }) : nothing}
    ${almaLogoTemplate({ className: styles.logo, width: '75' })}
  </div>`
}
