import { html } from 'lit'

import { createIntl } from '@/shared/i18n/create-intl'
import { amexTemplate } from '@/shared/templates/card-logos/amex.template'
import { cbTemplate } from '@/shared/templates/card-logos/cb.template'
import { mastercardTemplate } from '@/shared/templates/card-logos/mastercard.template'
import { visaTemplate } from '@/shared/templates/card-logos/visa.template'
import { renderTemplate } from '@/test/utils/render-template'

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

describe('payment cards', () => {
  const fr = createIntl('fr')

  it.each([
    { name: 'Amex', template: amexTemplate },
    { name: 'CB', template: cbTemplate },
    { name: 'Mastercard', template: mastercardTemplate },
    { name: 'Visa', template: visaTemplate },
  ])('should render the $name card without an attribute holding "undefined"', ({ template }) => {
    const container = renderTemplate(template({ intl: fr }))

    expect(attributesHoldingUndefined(container)).toEqual([])
  })

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
