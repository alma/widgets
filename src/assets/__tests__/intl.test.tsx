import React from 'react'

import AmexCard from '@/assets/cards/amex'
import CbCard from '@/assets/cards/cb'
import MasterCard from '@/assets/cards/mastercard'
import VisaCard from '@/assets/cards/visa'
import CrossIcon from '@/assets/Cross'
import renderWithProviders from '@/test/index'

describe('Assets Internationalization', () => {
  it('should render Cross icon with intl aria-label', () => {
    const { container } = renderWithProviders(<CrossIcon />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Fermer')
  })

  it('should render Visa card with intl aria-label', () => {
    const { container } = renderWithProviders(<VisaCard />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Carte Visa acceptée')
  })

  it('should render Amex card with intl aria-label', () => {
    const { container } = renderWithProviders(<AmexCard />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Carte American Express acceptée')
  })

  it('should render CB card with intl aria-label', () => {
    const { container } = renderWithProviders(<CbCard />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Carte Bancaire CB acceptée')
  })

  it('should render MasterCard with intl aria-label', () => {
    const { container } = renderWithProviders(<MasterCard />)
    const svg = container.querySelector('svg')
    expect(svg).toHaveAttribute('aria-label', 'Carte Mastercard acceptée')
  })
})
