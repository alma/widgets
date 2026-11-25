import { screen, within } from '@testing-library/dom'
import { html } from 'lit'

import { MediaQueryController } from '@/shared/controllers/media-query.controller'
import { LightDomElement } from '@/shared/custom-elements/light-dom-element'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { mockCards } from '@/test/fixtures/plans'
import { useFakeMatchMedia } from '@/test/utils/match-media'
import { renderTemplate } from '@/test/utils/render-template'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'
import type { Card } from '@/widgets/eligibility-modal/templates/modal-layout/cards/cards.types'
import {
  type ModalLayoutParams,
  modalLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/modal-layout/modal-layout.template'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell/modal-shell.template'

const intl = createIntl(Locale.fr)

// Picks the layout as the eligibility modal will, from the desktop query.
class ModalLayoutHost extends LightDomElement {
  readonly isBigScreen = new MediaQueryController(this, desktopMediaQuery)

  protected override render() {
    return modalLayoutTemplate({
      isBigScreen: this.isBigScreen.matches,
      isCurrentPlanP1X: false,
      isSomePlanDeferred: false,
      intl,
    })
  }
}
customElements.define('test-modal-layout-host', ModalLayoutHost)

const appendHost = async (): Promise<ModalLayoutHost> => {
  const host = document.createElement('test-modal-layout-host') as ModalLayoutHost
  document.body.append(host)
  await host.updateComplete
  return host
}

const renderModal = (params: Partial<ModalLayoutParams> = {}) =>
  renderTemplate(
    modalShellTemplate({
      onClose: vi.fn(),
      scrollable: true,
      children: modalLayoutTemplate({
        isBigScreen: false,
        isCurrentPlanP1X: false,
        isSomePlanDeferred: false,
        cards: mockCards,
        children: html`<p>Plans</p>`,
        intl,
        ...params,
      }),
      intl,
    }),
  )

const leftSide = () => document.querySelector('.alma-eligibility-modal-left-side')

describe('modal layout switch', () => {
  const matchMedia = useFakeMatchMedia()

  it('should render the desktop layout when the desktop query matches', async () => {
    matchMedia.setMatches(desktopMediaQuery, true)
    await appendHost()

    expect(screen.getByTestId('modal-container')).toHaveClass(
      'container alma-eligibility-modal-desktop-modal',
      { exact: true },
    )
    expect(leftSide()).toBeInTheDocument()
  })

  it('should render the mobile layout when the desktop query does not match', async () => {
    await appendHost()

    expect(screen.getByTestId('modal-container')).toHaveClass(
      'container alma-eligibility-modal-mobile-modal',
      { exact: true },
    )
    expect(leftSide()).not.toBeInTheDocument()
  })
})

describe.each([
  ['desktop', true],
  ['mobile', false],
])('%s layout', (_, isBigScreen) => {
  it('should render its children in the dialog', () => {
    renderModal({ isBigScreen })

    const dialog = screen.getByRole('dialog')
    expect(within(dialog).getByText('Plans')).toBeInTheDocument()
  })

  it('should pass its logo class and a width of 75 to the Alma logo', () => {
    renderModal({ isBigScreen })

    const logo = screen.getByTestId('modal-container').querySelector('.logo')
    expect(logo?.tagName).toBe('svg')
    expect(logo).toHaveAttribute('width', '75')
  })

  it('should show the title for deferred true and P1X false', () => {
    renderModal({ isBigScreen, isSomePlanDeferred: true, isCurrentPlanP1X: false })

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.',
      { normalizeWhitespace: false },
    )
  })

  it('should pass isCurrentPlanP1X to the info list', () => {
    renderModal({ isBigScreen, isCurrentPlanP1X: true })

    const info = screen.getByRole('region', { name: 'Comment procéder au paiement' })
    expect(info).toHaveTextContent('Payer maintenant')
  })

  // Merchants can pass null, which means no cards.
  it.each([undefined, null])('should not display card logos if %s is provided', (cards) => {
    renderModal({ isBigScreen, cards: cards as Card[] | undefined })

    expect(screen.queryByTestId('card-logos')).not.toBeInTheDocument()
  })

  it('should display provided card logos', () => {
    renderModal({ isBigScreen, cards: ['amex', 'cb'] })

    expect(screen.getByTestId('card-logos')).toBeInTheDocument()
    expect(screen.getByTestId('card-logo-amex')).toBeInTheDocument()
    expect(screen.getByTestId('card-logo-cb')).toBeInTheDocument()
    expect(screen.queryByTestId('card-logo-mastercard')).not.toBeInTheDocument()
    expect(screen.queryByTestId('card-logo-visa')).not.toBeInTheDocument()
  })
})
