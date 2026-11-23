import { within } from '@testing-library/dom'
import { axe } from 'vitest-axe'

import { renderTemplate } from '@/test/utils/render-template'
import { loaderTemplate } from '@/widgets/payment-plans/templates/loader/loader.template'

const renderLoader = (className?: string) => {
  const container = renderTemplate(loaderTemplate({ className }))
  return { container, loader: within(container).getByTestId('loader') }
}

describe('loaderTemplate', () => {
  it('should not add a role, an aria attribute or a tabindex', () => {
    const { loader } = renderLoader()

    expect(loader.getAttributeNames().sort()).toEqual(['class', 'data-testid'])
    expect(loader.querySelectorAll('[role], [tabindex], [aria-live], [aria-label]')).toHaveLength(0)
  })

  it('should not have any accessibility violations', async () => {
    expect(await axe(renderLoader().container)).toHaveNoViolations()
  })

  it('should not have any accessibility violations with an extra class', async () => {
    expect(await axe(renderLoader('custom-loader').container)).toHaveNoViolations()
  })
})
