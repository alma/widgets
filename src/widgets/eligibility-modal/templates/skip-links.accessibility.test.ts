import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import { renderTemplate } from '@/test/render-template'
import {
  eligibilityModalMessages,
  skipLinksMessages,
} from '@/widgets/eligibility-modal/eligibility-modal.messages'
import {
  type SkipLinksParams,
  skipLinksTemplate,
} from '@/widgets/eligibility-modal/templates/skip-links.template'

const intl = createIntl(Locale.fr)

const renderSkipLinks = (params: Pick<SkipLinksParams, 'skipLinks' | 'className'>) =>
  renderTemplate(skipLinksTemplate({ ...params, intl }))

describe('SkipLinks Accessibility Tests', () => {
  const skipLinksData = [
    {
      href: '#main-content',
      labelId: eligibilityModalMessages.skipToPaymentInfo.id,
      defaultMessage: eligibilityModalMessages.skipToPaymentInfo.defaultMessage,
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

  it('should have proper semantic structure for screen readers', async () => {
    const container = renderSkipLinks({ skipLinks: skipLinksData })

    const navigation = container.querySelector('[role="navigation"]')
    expect(navigation).toBeInTheDocument()
    expect(navigation).toHaveAttribute('aria-label', 'Navigation rapide')

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(2)

    links.forEach((link) => {
      expect(link).toHaveAttribute('href')
      expect(link.getAttribute('href')).toMatch(/^#/)
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle empty skip links array', async () => {
    const container = renderSkipLinks({ skipLinks: [] })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should work with custom className', async () => {
    const container = renderSkipLinks({ skipLinks: skipLinksData, className: 'custom-class' })

    const navigation = container.querySelector('[role="navigation"]')
    expect(navigation).toHaveClass('custom-class')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
