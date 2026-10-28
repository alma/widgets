import { html, render, type TemplateResult } from 'lit'
import { axe } from 'vitest-axe'

import { almaLogoTemplate } from '@/shared/ui/icons/alma-logo.template'
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
})
