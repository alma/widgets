import { render } from 'lit'
import { axe } from 'vitest-axe'

import { createIntl } from '@/shared/i18n/create-intl'
import { amexTemplate } from '@/shared/templates/card-logos/amex.template'
import { cbTemplate } from '@/shared/templates/card-logos/cb.template'
import { mastercardTemplate } from '@/shared/templates/card-logos/mastercard.template'
import { visaTemplate } from '@/shared/templates/card-logos/visa.template'
import { renderTemplate } from '@/test/utils/render-template'

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
      expect(await axe(container)).toHaveNoViolations()

      render(template({ intl: createIntl('en') }), container)
      expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe(englishLabel)
    },
  )
})
