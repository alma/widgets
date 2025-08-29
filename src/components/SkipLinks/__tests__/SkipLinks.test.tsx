import React from 'react'

import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('should focus target element when skip link is clicked', async () => {
    const user = userEvent.setup()

    // Create a target element in the DOM
    const targetElement = document.createElement('div')
    targetElement.id = 'payment-schedule'
    targetElement.tabIndex = -1
    document.body.appendChild(targetElement)

    // Mock focus method
    const focusSpy = jest.spyOn(targetElement, 'focus')

    renderWithIntl(<SkipLinks skipLinks={mockSkipLinks} />)

    // Click on the payment schedule skip link
    const skipLink = screen.getByRole('link', { name: 'Aller au calendrier de paiement' })
    await user.click(skipLink)

    // Wait for the setTimeout to execute
    await new Promise((resolve) => {
      setTimeout(resolve, 10)
    })

    // Verify that focus was called on the target element
    expect(focusSpy).toHaveBeenCalled()

    // Clean up
    document.body.removeChild(targetElement)
    focusSpy.mockRestore()
  })

  it('should handle click on skip link when target element does not exist', async () => {
    const user = userEvent.setup()

    renderWithIntl(<SkipLinks skipLinks={mockSkipLinks} />)

    // Click on a skip link for a non-existent element
    const skipLink = screen.getByRole('link', { name: 'Aller aux options de paiement' })

    // This should not throw an error
    await expect(user.click(skipLink)).resolves.not.toThrow()
  })
})
