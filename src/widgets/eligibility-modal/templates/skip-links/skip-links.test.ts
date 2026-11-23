import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
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
  it('should point each skip link at its section', () => {
    renderSkipLinks()

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

  it('should add the custom class to the navigation', () => {
    const container = renderSkipLinks({ className: 'custom-class' })

    const navigation = container.querySelector('[role="navigation"]')
    expect(navigation).toHaveClass('custom-class')
  })

  it('should handle click on skip link when target element does not exist', async () => {
    const user = userEvent.setup()

    renderSkipLinks()

    const skipLink = screen.getByRole('link', { name: 'Aller aux options de paiement' })

    await expect(user.click(skipLink)).resolves.not.toThrow()
  })
})
