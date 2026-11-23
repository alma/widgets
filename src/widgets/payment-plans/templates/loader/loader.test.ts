import { within } from '@testing-library/dom'

import { renderTemplate } from '@/test/utils/render-template'
import { loaderTemplate } from '@/widgets/payment-plans/templates/loader/loader.template'

const renderLoader = (className?: string) => {
  const container = renderTemplate(loaderTemplate({ className }))
  return { container, loader: within(container).getByTestId('loader') }
}

describe('loaderTemplate', () => {
  it('should render two lines', () => {
    const { loader } = renderLoader()

    expect(loader.tagName).toBe('DIV')
    expect(loader).toHaveClass('loadingIndicator', { exact: true })
    expect([...loader.children].map((line) => [line.tagName, line.className])).toEqual([
      ['DIV', 'line1'],
      ['DIV', 'line2'],
    ])
    expect(loader.textContent?.trim()).toBe('')
  })

  it('should add an extra class after its own', () => {
    const { loader } = renderLoader('custom-loader')

    expect([...loader.classList]).toEqual(['loadingIndicator', 'custom-loader'])
  })

  it('should not add an empty class', () => {
    expect(renderLoader('').loader).toHaveClass('loadingIndicator', { exact: true })
  })
})
