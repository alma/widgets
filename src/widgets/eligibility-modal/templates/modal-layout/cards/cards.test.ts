import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { cardsTemplate } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.template'
import type { Card } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.types'

const intl = createIntl(Locale.fr)

const renderCards = (cards: Card[]) => renderTemplate(cardsTemplate({ cards, intl }))

describe('cardsTemplate', () => {
  it('should not display card logos if an empty array is provided', () => {
    renderCards([])

    expect(screen.getByTestId('card-logos')).toBeInTheDocument()
    expect(screen.queryAllByTestId(/^card-logo-/)).toHaveLength(0)
  })

  it('should display all card logos, each labelled in French', () => {
    renderCards(['amex', 'cb', 'mastercard', 'visa'])

    expect(screen.getAllByTestId(/^card-logo-/).map((logo) => logo.dataset.testid)).toEqual([
      'card-logo-amex',
      'card-logo-cb',
      'card-logo-mastercard',
      'card-logo-visa',
    ])
    expect(screen.getAllByRole('img').map((logo) => logo.getAttribute('aria-label'))).toEqual([
      'Carte American Express acceptée',
      'Carte Bancaire CB acceptée',
      'Carte Mastercard acceptée',
      'Carte Visa acceptée',
    ])
  })

  it('should display a repeated card once, in first-seen order', () => {
    renderCards(['visa', 'cb', 'visa'])

    expect(screen.getAllByTestId(/^card-logo-/).map((logo) => logo.dataset.testid)).toEqual([
      'card-logo-visa',
      'card-logo-cb',
    ])
  })

  it('should render an empty div for a card without a logo', () => {
    renderCards(['discover' as Card])

    expect(screen.getByTestId('card-logo-discover')).toBeEmptyDOMElement()
  })
})
