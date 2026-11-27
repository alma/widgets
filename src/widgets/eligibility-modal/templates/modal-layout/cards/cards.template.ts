import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { IntlShape } from '@/shared/i18n/i18n.types'
import { amexTemplate } from '@/shared/templates/card-logos/amex.template'
import { cbTemplate } from '@/shared/templates/card-logos/cb.template'
import { mastercardTemplate } from '@/shared/templates/card-logos/mastercard.template'
import { visaTemplate } from '@/shared/templates/card-logos/visa.template'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import styles from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.module.css'
import type { Card } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.types'

export interface CardsParams {
  cards: Card[]
  intl: IntlShape
}

const cardLogoTemplate = (card: Card, intl: IntlShape) => {
  if (card === 'cb') {
    return cbTemplate({ intl })
  }
  if (card === 'amex') {
    return amexTemplate({ intl })
  }
  if (card === 'mastercard') {
    return mastercardTemplate({ intl })
  }
  if (card === 'visa') {
    return visaTemplate({ intl })
  }
  return nothing
}

export const cardsTemplate = ({ cards, intl }: CardsParams): TemplateResult => {
  // Keep this exact call: pages that load Prototype.js replace Array.from,
  // and their logos depend on it.
  const uniqueCards = Array.from(new Set(cards))
  const classes = classMap({
    [styles.cardContainer]: true,
    [STATIC_CUSTOMISATION_CLASSES.cardContainer]: true,
  })
  // cards.module.css has no .card rule, so no class there.
  // Prettier would wrap the logo in whitespace, which adds text nodes to the div.
  // prettier-ignore
  return html`<div data-testid="card-logos" class=${classes}>
    ${uniqueCards.map(
    (card) =>
      html`<div class=${ifDefined(styles.card)} data-testid="card-logo-${card}">${cardLogoTemplate(card, intl)}</div>`,
  )}
  </div>`
}
