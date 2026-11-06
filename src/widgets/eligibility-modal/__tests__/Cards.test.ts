import { screen } from '@testing-library/dom'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import type { Card } from '@/shared/ui/icons/cards/cards.types'
import { renderTemplate } from '@/test/render-template'
import { modalLayoutTemplate } from '@/widgets/eligibility-modal/templates/modal-layout.template'

const intl = createIntl(Locale.fr)

// Master renders the whole modal, whose layout is mobile unless the test gives a desktop width.
const renderModal = (cards?: Card[] | null, isBigScreen = false) =>
  renderTemplate(
    modalLayoutTemplate({
      isBigScreen,
      isCurrentPlanP1X: false,
      isSomePlanDeferred: false,
      // Merchants can pass null, which master treats as no cards.
      cards: cards as Card[] | undefined,
      intl,
    }),
  )

it('should not display card logos if they are not provided', () => {
  renderModal()

  expect(screen.queryByTestId('card-logos')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-amex')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-cb')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should not display card logos if an empty array is provided', () => {
  renderModal([])

  expect(screen.getByTestId('card-logos')).toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-amex')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-cb')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should display provided card logos', () => {
  renderModal(['amex', 'cb'])

  expect(screen.getByTestId('card-logos')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should display provided card logos with Desktop Modal', () => {
  renderModal(['amex', 'cb'], true)

  expect(screen.getByTestId('card-logos')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
  expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
})

it('should display all cards logos', () => {
  renderModal(['amex', 'cb', 'mastercard', 'visa'])

  expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-mastercard')).toBeInTheDocument()
  expect(screen.getByTestId('card-logo-visa')).toBeInTheDocument()
})

it('should not display card logos if null is provided', () => {
  renderModal(null)

  expect(screen.queryByTestId('card-logos')).not.toBeInTheDocument()
})

it('should display a repeated card once, in first-seen order', () => {
  renderModal(['visa', 'cb', 'visa'])

  expect(screen.getAllByTestId(/^card-logo-/).map((logo) => logo.dataset.testid)).toEqual([
    'card-logo-visa',
    'card-logo-cb',
  ])
})

it('should render an empty div for a card without a logo', () => {
  renderModal(['discover' as Card])

  expect(screen.getByTestId('card-logo-discover')).toBeEmptyDOMElement()
})

it('should label each logo in French', () => {
  renderModal(['amex', 'cb', 'mastercard', 'visa'])

  expect(screen.getAllByRole('img').map((logo) => logo.getAttribute('aria-label'))).toEqual([
    'Carte American Express acceptée',
    'Carte Bancaire CB acceptée',
    'Carte Mastercard acceptée',
    'Carte Visa acceptée',
  ])
})
