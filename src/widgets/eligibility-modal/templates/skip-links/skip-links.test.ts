import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/render-template'
import { modalContentMessages } from '@/widgets/eligibility-modal/templates/modal-content.messages'
import {
  type SkipLinksParams,
  skipLinksTemplate,
} from '@/widgets/eligibility-modal/templates/skip-links/skip-links.template'

const intl = createIntl(Locale.fr)

const mockSkipLinks = [
  {
    href: '#payment-plans',
    labelId: modalContentMessages.skipToPaymentPlans.id,
    defaultMessage: modalContentMessages.skipToPaymentPlans.defaultMessage,
  },
  {
    href: '#payment-info',
    labelId: modalContentMessages.skipToPaymentInfo.id,
    defaultMessage: modalContentMessages.skipToPaymentInfo.defaultMessage,
  },
  {
    href: '#payment-schedule',
    labelId: modalContentMessages.skipToPaymentSchedule.id,
    defaultMessage: modalContentMessages.skipToPaymentSchedule.defaultMessage,
  },
]

const renderSkipLinks = (params: Partial<SkipLinksParams> = {}) =>
  renderTemplate(skipLinksTemplate({ skipLinks: mockSkipLinks, intl, ...params }))

describe('SkipLinks', () => {
  it('should render skip links for accessibility', () => {
    renderSkipLinks()

    expect(screen.getByRole('navigation', { name: 'Navigation rapide' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Aller aux options de paiement' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Aller aux informations de paiement' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Aller au calendrier de paiement' }),
    ).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Aller aux options de paiement' })).toHaveAttribute(
      'href',
      '#payment-plans',
    )
    expect(
      screen.getByRole('link', { name: 'Aller aux informations de paiement' }),
    ).toHaveAttribute('href', '#payment-info')
    expect(screen.getByRole('link', { name: 'Aller au calendrier de paiement' })).toHaveAttribute(
      'href',
      '#payment-schedule',
    )
  })

  it('should render with custom className', () => {
    const container = renderSkipLinks({ className: 'custom-class' })
    // firstChild would be one of Lit's comment markers.
    expect(container.firstElementChild).toHaveClass('custom-class')
  })

  it('should focus target element when skip link is clicked', async () => {
    const user = userEvent.setup()

    const targetElement = document.createElement('div')
    targetElement.id = 'payment-schedule'
    targetElement.tabIndex = -1
    document.body.appendChild(targetElement)

    const focusSpy = vi.spyOn(targetElement, 'focus')

    renderSkipLinks()

    const skipLink = screen.getByRole('link', { name: 'Aller au calendrier de paiement' })
    await user.click(skipLink)

    await new Promise((resolve) => {
      setTimeout(resolve, 10)
    })

    expect(focusSpy).toHaveBeenCalled()
  })

  it('should handle click on skip link when target element does not exist', async () => {
    const user = userEvent.setup()

    renderSkipLinks()

    const skipLink = screen.getByRole('link', { name: 'Aller aux options de paiement' })

    await expect(user.click(skipLink)).resolves.not.toThrow()
  })
})
