import { screen } from '@testing-library/dom'
import userEvent from '@testing-library/user-event'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/utils/render-template'
import { modalContentMessages } from '@/widgets/eligibility-modal/templates/modal-content.messages'
import { skipLinksMessages } from '@/widgets/eligibility-modal/templates/skip-links/skip-links.messages'
import {
  type SkipLinksParams,
  skipLinksTemplate,
} from '@/widgets/eligibility-modal/templates/skip-links/skip-links.template'

const intl = createIntl(Locale.fr)

const renderSkipLinks = (params: Pick<SkipLinksParams, 'skipLinks' | 'className'>) =>
  renderTemplate(skipLinksTemplate({ ...params, intl }))

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

describe('SkipLinks Accessibility Tests', () => {
  const skipLinksData = [
    {
      href: '#main-content',
      labelId: modalContentMessages.skipToPaymentInfo.id,
      defaultMessage: modalContentMessages.skipToPaymentInfo.defaultMessage,
    },
    {
      href: '#navigation',
      labelId: skipLinksMessages.navigationAriaLabel.id,
      defaultMessage: skipLinksMessages.navigationAriaLabel.defaultMessage,
    },
  ]

  it('should not have any accessibility violations', async () => {
    const container = renderSkipLinks({ skipLinks: skipLinksData })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle empty skip links array', async () => {
    const container = renderSkipLinks({ skipLinks: [] })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should not have any accessibility violations with a custom class', async () => {
    const container = renderSkipLinks({ skipLinks: skipLinksData, className: 'custom-class' })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should render a named navigation with a link to each section', () => {
    renderSkipLinks({ skipLinks: mockSkipLinks })

    expect(screen.getByRole('navigation', { name: 'Navigation rapide' })).toBeInTheDocument()

    expect(screen.getByRole('link', { name: 'Aller aux options de paiement' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Aller aux informations de paiement' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Aller au calendrier de paiement' }),
    ).toBeInTheDocument()
  })

  it('should focus target element when skip link is clicked', async () => {
    const user = userEvent.setup()

    const targetElement = document.createElement('div')
    targetElement.id = 'payment-schedule'
    targetElement.tabIndex = -1
    document.body.appendChild(targetElement)

    const focusSpy = vi.spyOn(targetElement, 'focus')

    renderSkipLinks({ skipLinks: mockSkipLinks })

    const skipLink = screen.getByRole('link', { name: 'Aller au calendrier de paiement' })
    await user.click(skipLink)

    await new Promise((resolve) => {
      setTimeout(resolve, 10)
    })

    expect(focusSpy).toHaveBeenCalled()
  })
})
