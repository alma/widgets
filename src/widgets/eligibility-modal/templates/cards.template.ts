import { html, nothing, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { IntlShape } from '@/shared/i18n/i18n.types'
import { amexTemplate } from '@/shared/ui/icons/cards/amex.template'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { cbTemplate } from '@/shared/ui/icons/cards/cb.template'
import { mastercardTemplate } from '@/shared/ui/icons/cards/mastercard.template'
import { visaTemplate } from '@/shared/ui/icons/cards/visa.template'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import styles from '@/widgets/eligibility-modal/templates/cards.module.css'

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
  // Master's exact call, so a page where Prototype.js replaces Array.from renders what master does.
  const uniqueCards = Array.from(new Set(cards))
  const classes = classMap({
    [styles.cardContainer]: true,
    [STATIC_CUSTOMISATION_CLASSES.cardContainer]: true,
  })
  // cards.module.css has no .card rule, so master renders no class there.
  // Prettier would wrap the logo in whitespace, which master's div lacks.
  // prettier-ignore
  return html`<div data-testid="card-logos" class=${classes}>
    ${uniqueCards.map(
    (card) =>
      html`<div class=${ifDefined(styles.card)} data-testid="card-logo-${card}">${cardLogoTemplate(card, intl)}</div>`,
  )}
  </div>`
}
