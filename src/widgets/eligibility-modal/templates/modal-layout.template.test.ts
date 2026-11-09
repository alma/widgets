import { screen, within } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { html } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { MediaQueryController } from '@/shared/ui/media-query.controller'
import { mockCards } from '@/test/fixtures'
import { useFakeMatchMedia } from '@/test/match-media'
import { renderTemplate } from '@/test/render-template'
import { desktopMediaQuery } from '@/widgets/eligibility-modal/eligibility-modal.const'
import {
  type ModalLayoutParams,
  modalLayoutTemplate,
} from '@/widgets/eligibility-modal/templates/modal-layout.template'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell.template'

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

const renderModal = (
  params: Partial<ModalLayoutParams> = {},
  onClose: (event: MouseEvent) => void = vi.fn(),
) =>
  renderTemplate(
    modalShellTemplate({
      onClose,
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

  it('should swap the layouts when the match changes', async () => {
    const host = await appendHost()

    matchMedia.setMatches(desktopMediaQuery, true)
    await host.updateComplete
    expect(leftSide()).toBeInTheDocument()

    matchMedia.setMatches(desktopMediaQuery, false)
    await host.updateComplete
    expect(leftSide()).not.toBeInTheDocument()
  })

  it('should stop listening once the host is removed', async () => {
    const host = await appendHost()

    host.remove()

    expect(matchMedia.listenerCount(desktopMediaQuery)).toBe(0)
  })
})

describe.each([
  ['desktop', true],
  ['mobile', false],
])('%s layout', (_, isBigScreen) => {
  it('should not have any accessibility violations', async () => {
    expect(await axe(renderModal({ isBigScreen }))).toHaveNoViolations()
  })

  it("should render master's dialog, labelled by the title", () => {
    renderModal({ isBigScreen })

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAccessibleName('Payez en plusieurs fois par carte bancaire avec Alma.')
    expect(within(dialog).getByText('Plans')).toBeInTheDocument()
  })

  it('should pass its logo class and a width of 75 to the Alma logo', () => {
    renderModal({ isBigScreen })

    const logo = screen.getByTestId('modal-container').querySelector('.logo')
    expect(logo?.tagName).toBe('svg')
    expect(logo).toHaveAttribute('width', '75')
  })

  it.each([
    [false, false, 'Payez en plusieurs fois par carte bancaire avec Alma.'],
    [false, true, 'Payez comptant par carte bancaire avec Alma.'],
    [true, false, 'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.'],
    [true, true, 'Payez en plusieurs fois ou plus tard par carte bancaire avec Alma.'],
  ])(
    'should show the title for deferred %s and P1X %s',
    (isSomePlanDeferred, isCurrentPlanP1X, title) => {
      renderModal({ isBigScreen, isSomePlanDeferred, isCurrentPlanP1X })

      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(title, {
        normalizeWhitespace: false,
      })
      expect(screen.getByTestId('modal-title-element')).toHaveAttribute('id', 'modal-title')
    },
  )

  it.each([
    [
      false,
      [
        'Choisissez Alma au moment du paiement.',
        'Laissez-vous guider et validez votre paiement en 2 minutes.',
        'Gardez le contrôle en avançant ou reculant vos échéances à votre rythme.',
      ],
      ['Alma', '2 minutes.', 'Gardez le contrôle'],
    ],
    [
      true,
      [
        'Choisissez Alma - Payer maintenant au moment du paiement.',
        'Renseignez les informations de votre carte bancaire.',
        // The French message has a space inside the strong tag and another after it.
        'La validation  de votre paiement est instantanée !',
      ],
      ['Alma - Payer maintenant', 'carte bancaire.', 'La validation '],
    ],
  ])('should show the info bullets for P1X %s', (isCurrentPlanP1X, bullets, strongTexts) => {
    renderModal({ isBigScreen, isCurrentPlanP1X })

    const info = screen.getByRole('region', { name: 'Comment procéder au paiement' })
    expect(info).toHaveAttribute('id', 'payment-info')
    const items = within(info).getAllByRole('listitem')
    expect(
      items.map((item) => item.querySelector('.alma-eligibility-modal-bullet')?.textContent),
    ).toEqual(['1', '2', '3'])
    expect(
      items.map((item) => item.querySelector('.alma-eligibility-modal-info-message')?.textContent),
    ).toEqual(bullets)
    expect([...info.querySelectorAll('strong')].map((strong) => strong.textContent)).toEqual(
      strongTexts,
    )
  })
})

describe('info', () => {
  it("should keep master's ARIA and list class", () => {
    renderModal()

    const info = screen.getByTestId('modal-info-element')
    expect(info).toHaveAttribute('aria-describedby', 'payment-info-description')
    expect(info).toHaveAttribute('tabindex', '-1')
    // Master's golden DOM has the listContainer class on the list.
    expect(info.querySelector('ol#payment-info-description')).toHaveClass('listContainer', {
      exact: true,
    })
    expect(screen.getByRole('heading', { level: 2 })).toHaveClass('sr-only', { exact: true })
  })
})

describe('modal shell', () => {
  it('should render the close button with its French label', () => {
    renderModal()

    const button = screen.getByRole('button', { name: 'Fermer la fenêtre' })
    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('data-testid', 'modal-close-button')
    expect(button).toHaveClass('closeButton alma-eligibility-modal-close-button', { exact: true })
  })

  it('should call onClose with the click event', async () => {
    const onClose = vi.fn()
    renderModal({}, onClose)

    await userEvent.click(screen.getByTestId('modal-close-button'))

    expect(onClose).toHaveBeenCalledOnce()
    expect(onClose.mock.calls[0][0]).toBeInstanceOf(MouseEvent)
    expect(onClose.mock.calls[0][0]).toHaveProperty('type', 'click')
  })

  it('should hide the cross icon from assistive technologies', () => {
    renderModal()

    const cross = screen.getByTestId('modal-close-button').querySelector('svg')
    expect(cross).toHaveAttribute('aria-hidden', 'true')
    expect(cross).toHaveAttribute('focusable', 'false')
    expect(cross).not.toHaveAttribute('class')
  })

  it.each([
    [true, 'content contentScrollable'],
    [false, 'content'],
  ])('should render the content div with scrollable %s', (scrollable, classes) => {
    const container = renderTemplate(modalShellTemplate({ onClose: vi.fn(), scrollable, intl }))

    expect(container.lastElementChild).toHaveClass(classes, { exact: true })
  })

  it('should add the content class it is given', () => {
    const container = renderTemplate(
      modalShellTemplate({ onClose: vi.fn(), contentClassName: 'extra', intl }),
    )

    expect(container.lastElementChild).toHaveClass('content extra', { exact: true })
  })
})
