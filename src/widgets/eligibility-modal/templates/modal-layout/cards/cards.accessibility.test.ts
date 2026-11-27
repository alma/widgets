import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { cardsTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.template'
import type { Card } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.types'

const intl = createIntl(Locale.fr)

const renderCards = (cards: Card[]) => renderTemplate(cardsTemplate({ cards, intl }))

describe('cardsTemplate', () => {
  it('should label each card logo in French', () => {
    renderCards(['amex', 'cb', 'mastercard', 'visa'])

    expect(screen.getAllByRole('img').map((logo) => logo.getAttribute('aria-label'))).toEqual([
      'Carte American Express acceptée',
      'Carte Bancaire CB acceptée',
      'Carte Mastercard acceptée',
      'Carte Visa acceptée',
    ])
  })
})
