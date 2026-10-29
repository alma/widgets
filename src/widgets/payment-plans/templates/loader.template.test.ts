import { within } from '@testing-library/dom'
import { axe } from 'vitest-axe'

import { renderTemplate } from '@/test/render-template'
import { loaderTemplate } from '@/widgets/payment-plans/templates/loader.template'

const renderLoader = (className?: string) => {
  const container = renderTemplate(loaderTemplate({ className }))
  return { container, loader: within(container).getByTestId('loader') }
}

describe('loaderTemplate', () => {
  it("should render master's two lines", () => {
    const { loader } = renderLoader()

    expect(loader.tagName).toBe('DIV')
    expect(loader).toHaveClass('loadingIndicator', { exact: true })
    expect([...loader.children].map((line) => [line.tagName, line.className])).toEqual([
      ['DIV', 'line1'],
      ['DIV', 'line2'],
    ])
    expect(loader.textContent?.trim()).toBe('')
  })

  it('should not add a role, an aria attribute or a tabindex', () => {
    const { loader } = renderLoader()

    expect(loader.getAttributeNames().sort()).toEqual(['class', 'data-testid'])
    expect(loader.querySelectorAll('[role], [tabindex], [aria-live], [aria-label]')).toHaveLength(0)
  })

  it('should not have any accessibility violations', async () => {
    expect(await axe(renderLoader().container)).toHaveNoViolations()
  })

  it('should add an extra class after its own', async () => {
    const { container, loader } = renderLoader('custom-loader')

    expect([...loader.classList]).toEqual(['loadingIndicator', 'custom-loader'])
    expect(await axe(container)).toHaveNoViolations()
  })

  it('should not add an empty class', () => {
    expect(renderLoader('').loader).toHaveClass('loadingIndicator', { exact: true })
  })
})
