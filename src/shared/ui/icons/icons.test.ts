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

const renderToBody = (template: TemplateResult) => {
  const container = document.createElement('div')
  document.body.append(container)
  render(template, container)
  return container
}

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

describe('Accessibility - SVG & Logos', () => {
  describe('AlmaLogo Accessibility Tests', () => {
    it('should always be decorative with proper aria-hidden', async () => {
      const container = renderToBody(almaLogoTemplate())

      const logo = container.querySelector('svg')
      expect(logo).not.toBeNull()
      expect(logo?.getAttribute('aria-hidden')).toBe('true')
      expect(logo?.getAttribute('focusable')).toBe('false')
      expect(logo?.hasAttribute('aria-label')).toBe(false)
      expect(logo?.hasAttribute('role')).toBe(false)

      expect(await axe(container)).toHaveNoViolations()
    })

    it('should maintain visual styling with custom props', () => {
      const container = renderToBody(almaLogoTemplate({ color: '#ff0000', className: 'test-logo' }))

      const logo = container.querySelector('svg')
      expect(logo?.classList.contains('test-logo')).toBe(true)
      expect(logo?.querySelector('path')?.getAttribute('fill')).toBe('#ff0000')
      expect(logo?.getAttribute('aria-hidden')).toBe('true')
    })

    it('should support additional SVG attributes', async () => {
      const container = renderToBody(
        almaLogoTemplate({ testId: 'alma-logo', width: '100', height: '50' }),
      )

      const logo = container.querySelector('svg')
      expect(logo?.getAttribute('data-testid')).toBe('alma-logo')
      expect(logo?.getAttribute('width')).toBe('100')
      expect(logo?.getAttribute('height')).toBe('50')

      expect(await axe(container)).toHaveNoViolations()
    })

    it('should properly handle focus management', () => {
      const container = renderToBody(almaLogoTemplate())

      const logo = container.querySelector('svg')
      expect(logo?.getAttribute('focusable')).toBe('false')

      logo?.focus()
      expect(document.activeElement).not.toBe(logo)
    })

    it('should have correct default dimensions and viewBox', () => {
      const container = renderToBody(almaLogoTemplate())

      const logo = container.querySelector('svg')
      expect(logo?.getAttribute('width')).toBe('42')
      expect(logo?.getAttribute('height')).toBe('24')
      expect(logo?.getAttribute('viewBox')).toBe('0 0 352 120')
      expect(logo?.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg')
      expect(logo?.querySelector('path')?.getAttribute('fill')).toBe('#fa5022')
    })

    it('should not contains any RGAA violation (contradictory aria attributes)', async () => {
      const container = renderToBody(almaLogoTemplate())

      const logo = container.querySelector('svg')
      expect(logo?.getAttribute('aria-hidden')).toBe('true')
      expect(logo?.hasAttribute('aria-label')).toBe(false)
      expect(logo?.hasAttribute('role')).toBe(false)

      expect(await axe(container)).toHaveNoViolations()
    })

    it('should render no class or data-testid attribute when none is given', () => {
      const container = renderToBody(almaLogoTemplate({ className: undefined }))

      const logo = container.querySelector('svg')
      expect(logo?.hasAttribute('class')).toBe(false)
      expect(logo?.hasAttribute('data-testid')).toBe(false)
      expect(attributesHoldingUndefined(container)).toEqual([])
    })

    it('should render the modal logo as the desktop and mobile layouts pass it', () => {
      const container = renderToBody(almaLogoTemplate({ className: 'logo', width: '75' }))

      const logo = container.querySelector('svg')
      expect(logo?.getAttribute('class')).toBe('logo')
      expect(logo?.getAttribute('width')).toBe('75')
      expect(logo?.getAttribute('height')).toBe('24')
    })
  })

  describe('CrossIcon Accessibility Tests', () => {
    it('should always be decorative with proper aria-hidden', async () => {
      const container = renderToBody(crossTemplate())

      const icon = container.querySelector('svg')
      expect(icon).not.toBeNull()
      expect(icon?.getAttribute('aria-hidden')).toBe('true')
      expect(icon?.getAttribute('focusable')).toBe('false')
      expect(icon?.hasAttribute('aria-label')).toBe(false)
      expect(icon?.hasAttribute('role')).toBe(false)

      expect(await axe(container)).toHaveNoViolations()
    })

    it('should maintain visual appearance with custom props', () => {
      const container = renderToBody(crossTemplate({ color: '#ff0000', className: 'test-class' }))

      const icon = container.querySelector('svg')
      expect(icon?.classList.contains('test-class')).toBe(true)
      expect(icon?.querySelector('path')?.getAttribute('fill')).toBe('#ff0000')
      expect(icon?.getAttribute('aria-hidden')).toBe('true')
    })

    it('should work correctly in button context (standard usage)', async () => {
      const container = renderToBody(
        html`<button type="button" aria-label="Close window">${crossTemplate()}</button>`,
      )

      expect(container.querySelector('button')?.getAttribute('aria-label')).toBe('Close window')
      expect(container.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true')

      expect(await axe(container)).toHaveNoViolations()
    })

    it('should have correct dimensions and namespace', () => {
      const container = renderToBody(crossTemplate())

      const icon = container.querySelector('svg')
      expect(icon?.getAttribute('width')).toBe('16')
      expect(icon?.getAttribute('height')).toBe('16')
      expect(icon?.getAttribute('viewBox')).toBe('0 0 16 16')
      expect(icon?.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg')
      expect(icon?.querySelector('path')?.getAttribute('fill')).toBe('#fff')
    })

    it('should render no class attribute when none is given', () => {
      const container = renderToBody(crossTemplate())

      expect(container.querySelector('svg')?.hasAttribute('class')).toBe(false)
      expect(attributesHoldingUndefined(container)).toEqual([])
    })
  })

  describe('Payment Cards Accessibility Tests', () => {
    const fr = createIntl('fr')

    describe.each([
      {
        name: 'AmexCard',
        template: amexTemplate,
        label: 'Carte American Express acceptée',
        englishLabel: 'American Express card accepted',
      },
      {
        name: 'CbCard',
        template: cbTemplate,
        label: 'Carte Bancaire CB acceptée',
        englishLabel: 'CB credit card accepted',
      },
      {
        name: 'MastercardCard',
        template: mastercardTemplate,
        label: 'Carte Mastercard acceptée',
        englishLabel: 'Mastercard accepted',
      },
      {
        name: 'VisaCard',
        template: visaTemplate,
        label: 'Carte Visa acceptée',
        englishLabel: 'Visa card accepted',
      },
    ])('$name', ({ template, label, englishLabel }) => {
      it('should have proper accessibility attributes for informative icon', async () => {
        const container = renderToBody(template({ intl: fr }))

        const card = container.querySelector('svg')
        expect(card?.getAttribute('aria-label')).toBe(label)
        expect(card?.getAttribute('role')).toBe('img')
        expect(card?.hasAttribute('aria-hidden')).toBe(false)
        expect(card?.querySelector('title')).toBeNull()

        expect(await axe(container)).toHaveNoViolations()
      })

      it('should be findable by screen readers with correct label', () => {
        const container = renderToBody(template({ intl: fr }))

        expect(container.querySelector(`[aria-label="${label}"]`)).not.toBeNull()
      })

      it('should have correct dimensions and structure', () => {
        const container = renderToBody(template({ intl: fr }))

        const card = container.querySelector('svg')
        expect(card?.getAttribute('width')).toBe('24')
        expect(card?.getAttribute('height')).toBe('16')
        expect(card?.getAttribute('viewBox')).toBe('0 0 24 16')
        expect(card?.getAttribute('xmlns')).toBe('http://www.w3.org/2000/svg')
        expect(attributesHoldingUndefined(container)).toEqual([])
      })

      it("should take its aria-label from the locale's catalogue", () => {
        const container = renderToBody(template({ intl: createIntl('en') }))

        expect(container.querySelector('svg')?.getAttribute('aria-label')).toBe(englishLabel)
      })
    })

    describe('Payment Cards Integration Tests', () => {
      it('should all cards be accessible when rendered together', async () => {
        const container = renderToBody(
          html`<div>
            ${amexTemplate({ intl: fr })} ${cbTemplate({ intl: fr })}
            ${mastercardTemplate({ intl: fr })} ${visaTemplate({ intl: fr })}
          </div>`,
        )

        const labels = Array.from(container.querySelectorAll('svg'), (card) =>
          card.getAttribute('aria-label'),
        )
        expect(labels).toEqual([
          'Carte American Express acceptée',
          'Carte Bancaire CB acceptée',
          'Carte Mastercard acceptée',
          'Carte Visa acceptée',
        ])

        expect(await axe(container)).toHaveNoViolations()
      })

      it('should provide meaningful information to screen reader users', () => {
        const container = renderToBody(
          html`<div>
            <p>Cartes acceptées :</p>
            ${amexTemplate({ intl: fr })} ${cbTemplate({ intl: fr })}
            ${mastercardTemplate({ intl: fr })} ${visaTemplate({ intl: fr })}
          </div>`,
        )

        const acceptedCards = container.querySelectorAll('[role="img"]')
        expect(acceptedCards).toHaveLength(4)
        acceptedCards.forEach((card) => {
          expect(card.getAttribute('aria-label')).toMatch(/acceptée$/)
        })
      })
    })

    describe('SVG IDs', () => {
      const gradientTemplates = { amex: amexTemplate, cb: cbTemplate }

      it('should give each Amex and CB logo its own gradient ID', () => {
        const container = renderToBody(
          html`${amexTemplate({ intl: fr })} ${amexTemplate({ intl: fr })}
          ${cbTemplate({ intl: fr })} ${cbTemplate({ intl: fr })}`,
        )

        const ids = Array.from(container.querySelectorAll('[id]'), (element) => element.id)
        expect(ids).toHaveLength(4)
        expect(new Set(ids).size).toBe(4)
      })

      it('should point each gradient reference inside its own <svg>', () => {
        const container = renderToBody(
          html`${amexTemplate({ intl: fr })} ${amexTemplate({ intl: fr })}
          ${cbTemplate({ intl: fr })} ${cbTemplate({ intl: fr })}`,
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
          const container = renderToBody(template({ intl: fr }))
          const id = container.querySelector('linearGradient')?.id

          render(template({ intl: createIntl('en') }), container)

          expect(container.querySelectorAll('svg')).toHaveLength(1)
          expect(container.querySelector('linearGradient')?.id).toBe(id)
        },
      )

      it('should render the Mastercard logo without IDs', () => {
        const container = renderToBody(
          html`${mastercardTemplate({ intl: fr })} ${mastercardTemplate({ intl: fr })}`,
        )

        expect(container.querySelectorAll('[id]')).toHaveLength(0)
      })
    })
  })
})
