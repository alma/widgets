import React from 'react'

import { render, screen } from '@testing-library/react'
import { IntlProvider } from 'react-intl'

import '@testing-library/jest-dom'
import SkipLinks from 'components/SkipLinks'

const mockSkipLinks = [
  {
    href: '#payment-plans',
    labelId: 'skip-links.payment-plans',
    defaultMessage: 'Aller aux options de paiement',
  },
  {
    href: '#payment-info',
    labelId: 'skip-links.payment-info',
    defaultMessage: 'Aller aux informations de paiement',
  },
  {
    href: '#payment-schedule',
    labelId: 'skip-links.payment-schedule',
    defaultMessage: 'Aller au calendrier de paiement',
  },
]

// Wrapper to provide IntlProvider context
const renderWithIntl = (component: React.ReactElement) =>
  render(
    <IntlProvider locale="fr" messages={{}}>
      {component}
    </IntlProvider>,
  )

describe('SkipLinks', () => {
  it('should render skip links for accessibility', () => {
    renderWithIntl(<SkipLinks skipLinks={mockSkipLinks} />)

    // Verify that navigation is present
    expect(screen.getByRole('navigation', { name: 'Navigation rapide' })).toBeInTheDocument()

    // Verify that all skip links are present
    expect(screen.getByRole('link', { name: 'Aller aux options de paiement' })).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Aller aux informations de paiement' }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('link', { name: 'Aller au calendrier de paiement' }),
    ).toBeInTheDocument()

    // Verify the hrefs
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
    const { container } = renderWithIntl(
      <SkipLinks skipLinks={mockSkipLinks} className="custom-class" />,
    )
    expect(container.firstChild).toHaveClass('custom-class')
  })
})
