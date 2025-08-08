import React from 'react'

import { axe } from 'jest-axe'

import render from '@/test'
import SkipLinks from 'components/SkipLinks'

describe('SkipLinks Accessibility Tests', () => {
  const skipLinksData = [
    {
      href: '#main-content',
      labelId: 'skiplinks.main-content',
      defaultMessage: 'Aller au contenu principal',
    },
    {
      href: '#navigation',
      labelId: 'skiplinks.navigation',
      defaultMessage: 'Aller à la navigation',
    },
  ]

  it('should not have any accessibility violations', async () => {
    const { container } = render(<SkipLinks skipLinks={skipLinksData} />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should have proper semantic structure for screen readers', async () => {
    const { container } = render(<SkipLinks skipLinks={skipLinksData} />)

    // Vérifier la structure sémantique
    const navigation = container.querySelector('[role="navigation"]')
    expect(navigation).toBeInTheDocument()
    expect(navigation).toHaveAttribute('aria-label', 'Navigation rapide')

    const links = container.querySelectorAll('a')
    expect(links).toHaveLength(2)

    // Chaque lien doit pointer vers un élément valide
    links.forEach((link) => {
      expect(link).toHaveAttribute('href')
      expect(link.getAttribute('href')).toMatch(/^#/)
    })

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should handle empty skip links array', async () => {
    const { container } = render(<SkipLinks skipLinks={[]} />)

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should work with custom className', async () => {
    const { container } = render(<SkipLinks skipLinks={skipLinksData} className="custom-class" />)

    const navigation = container.querySelector('[role="navigation"]')
    expect(navigation).toHaveClass('custom-class')

    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
})
