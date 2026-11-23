import { axe } from 'vitest-axe'

import { crossTemplate } from '@/shared/templates/icons/cross.template'
import { renderTemplate } from '@/test/utils/render-template'

describe('crossTemplate', () => {
  it('should render the cross hidden from assistive technologies', async () => {
    const container = renderTemplate(crossTemplate())

    const svg = container.querySelector('svg')
    expect(svg?.getAttribute('aria-hidden')).toBe('true')
    expect(svg?.getAttribute('focusable')).toBe('false')
    expect(svg?.hasAttribute('aria-label')).toBe(false)
    expect(svg?.hasAttribute('role')).toBe(false)

    expect(await axe(container)).toHaveNoViolations()
  })
})
