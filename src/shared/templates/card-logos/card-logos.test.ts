import { html, render } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { amexTemplate } from '@/shared/templates/card-logos/amex.template'
import { cbTemplate } from '@/shared/templates/card-logos/cb.template'
import { mastercardTemplate } from '@/shared/templates/card-logos/mastercard.template'
import { visaTemplate } from '@/shared/templates/card-logos/visa.template'
import { renderTemplate } from '@/test/render-template'

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

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

    it.each([
      { name: 'Mastercard', template: mastercardTemplate },
      { name: 'Visa', template: visaTemplate },
    ])('should render the $name logo without IDs', ({ template }) => {
      const container = renderTemplate(html`${template({ intl: fr })} ${template({ intl: fr })}`)

      expect(container.querySelectorAll('[id]')).toHaveLength(0)
    })
  })
})
