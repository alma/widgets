import { axe } from 'vitest-axe'

import { almaLogoTemplate } from '@/shared/templates/alma-logo/alma-logo.template'
import { renderTemplate } from '@/test/utils/render-template'

describe('almaLogoTemplate', () => {
  it('should render the Alma logo hidden from assistive technologies', async () => {
    const container = renderTemplate(almaLogoTemplate())

    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('focusable')).toBe('false')
    expect(svg?.hasAttribute('aria-label')).toBe(false)
    expect(svg?.hasAttribute('role')).toBe(false)

    expect(await axe(container)).toHaveNoViolations()
  })
})
