import { axe } from 'vitest-axe'

import { almaLogoTemplate } from '@/shared/templates/alma-logo/alma-logo.template'
import { renderTemplate } from '@/test/render-template'

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

describe('almaLogoTemplate', () => {
  it('should render the Alma logo hidden from assistive technologies', async () => {
    const container = renderTemplate(almaLogoTemplate())

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
