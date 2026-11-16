import { html, render, type TemplateResult } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { almaLogoTemplate } from '@/shared/ui/icons/alma-logo.template'
import { amexTemplate } from '@/shared/ui/icons/cards/amex.template'
import { cbTemplate } from '@/shared/ui/icons/cards/cb.template'
import { mastercardTemplate } from '@/shared/ui/icons/cards/mastercard.template'
import { visaTemplate } from '@/shared/ui/icons/cards/visa.template'
import { crossTemplate } from '@/shared/ui/icons/cross.template'
import { renderTemplate } from '@/test/render-template'

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

describe('decorative icons', () => {
  it.each([
    { name: 'AlmaLogo', template: almaLogoTemplate },
    { name: 'Cross', template: crossTemplate },
  ])('should render $name hidden from assistive technologies', async ({ template }) => {
    const container = renderTemplate(template())

    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('focusable')).toBe('false')
    expect(svg?.hasAttribute('aria-label')).toBe(false)
    expect(svg?.hasAttribute('role')).toBe(false)
    expect(svg?.hasAttribute('class')).toBe(false)
    expect(attributesHoldingUndefined(container)).toEqual([])

    expect(await axe(container)).toHaveNoViolations()
  })
})

describe('payment cards', () => {
  const fr = createIntl('fr')

  it.each([
    {
      name: 'Amex',
      template: amexTemplate,
      label: 'Carte American Express acceptée',
      englishLabel: 'American Express card accepted',
    },
    {
      name: 'CB',
      template: cbTemplate,
      label: 'Carte Bancaire CB acceptée',
      englishLabel: 'CB credit card accepted',
    },
    {
      name: 'Mastercard',
      template: mastercardTemplate,
      label: 'Carte Mastercard acceptée',
      englishLabel: 'Mastercard accepted',
    },
    {
      name: 'Visa',
      template: visaTemplate,
      label: 'Carte Visa acceptée',
      englishLabel: 'Visa card accepted',
    },
  ])(
    'should render the $name card as a labelled image in the locale',
    async ({ template, label, englishLabel }) => {
      const container = renderTemplate(template({ intl: fr }))

      const card = container.querySelector('svg')
      expect(card?.getAttribute('role')).toBe('img')
      expect(card?.getAttribute('aria-label')).toBe(label)
      expect(card?.hasAttribute('aria-hidden')).toBe(false)
      expect(attributesHoldingUndefined(container)).toEqual([])
      expect(await axe(container)).toHaveNoViolations()

      render(template({ intl: createIntl('en') }), container)
      expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe(englishLabel)
    },
  )

  describe('SVG IDs', () => {
    const gradientTemplates = { amex: amexTemplate, cb: cbTemplate }

    it('should give each Amex and CB logo its own gradient ID', () => {
      const container = renderTemplate(
        html`${amexTemplate({ intl: fr })} ${amexTemplate({ intl: fr })} ${cbTemplate({ intl: fr })}
        ${cbTemplate({ intl: fr })}`,
      )

      const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id)
      expect(ids).toHaveLength(4)
      expect(new Set(ids).size).toBe(4)
    })

    it('should point each gradient reference inside its own <svg>', () => {
      const container = renderTemplate(
        html`${amexTemplate({ intl: fr })} ${amexTemplate({ intl: fr })} ${cbTemplate({ intl: fr })}
        ${cbTemplate({ intl: fr })}`,
      )

      container.querySelectorAll('svg').forEach((card) => {
        const references = Array.from(
          card.querySelectorAll('[fill^="url(#"]'),
          (element) => element.getAttribute('fill')?.slice('url(#'.length, -1) ?? '',
        )
        expect(references).toHaveLength(1)
        // Resolves to the first match on the page, like url(#…).
        const gradient = document.getElementById(references[0])
        expect(gradient?.localName).toBe('linearGradient')
        expect(card.contains(gradient)).toBe(true)
      })
    })

    it.each(Object.entries(gradientTemplates))(
      'should keep the %s gradient ID across re-renders',
      (_card, template: (params: { intl: IntlShape }) => TemplateResult) => {
        const container = renderTemplate(template({ intl: fr }))
        const id = container.querySelector('linearGradient')?.id

        render(template({ intl: createIntl('en') }), container)

        expect(container.querySelectorAll('svg')).toHaveLength(1)
        expect(container.querySelector('linearGradient')?.id).toBe(id)
      },
    )

    it('should render the Mastercard logo without IDs', () => {
      const container = renderTemplate(
        html`${mastercardTemplate({ intl: fr })} ${mastercardTemplate({ intl: fr })}`,
      )

      expect(container.querySelectorAll('[id]')).toHaveLength(0)
    })
  })
})
