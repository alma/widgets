import { within } from '@testing-library/dom'
import { axe } from 'vitest-axe'

import { renderTemplate } from '@/test/utils/render-template'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator/loading-indicator.template'

const renderIndicator = (className?: string) => {
  const container = renderTemplate(loadingIndicatorTemplate({ className }))
  return { container, indicator: within(container).getByTestId('loader') }
}

describe('loadingIndicatorTemplate', () => {
  it('should not add a role, an aria attribute or a tabindex', () => {
    const { indicator } = renderIndicator()

    expect(indicator.getAttributeNames().sort()).toEqual(['class', 'data-testid'])
    expect(
      indicator.querySelectorAll('[role], [tabindex], [aria-label], [aria-hidden], title'),
    ).toHaveLength(0)
  })

  it('should not have any accessibility violations', async () => {
    expect(await axe(renderIndicator().container)).toHaveNoViolations()
  })

  it('should not have any accessibility violations with an extra class', async () => {
    expect(await axe(renderIndicator('custom-loader').container)).toHaveNoViolations()
  })
})
