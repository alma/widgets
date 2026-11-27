import { within } from '@testing-library/dom'

import { renderTemplate } from '@/test/utils/render-template'
import { loadingIndicatorTemplate } from '@/widgets/eligibility-modal/templates/loading-indicator/loading-indicator.template'

const renderIndicator = (className?: string) => {
  const container = renderTemplate(loadingIndicatorTemplate({ className }))
  return { container, indicator: within(container).getByTestId('loader') }
}

describe('loadingIndicatorTemplate', () => {
  it('should render the Alma logo', () => {
    const { indicator } = renderIndicator()
    const svg = indicator.querySelector('svg')

    expect(indicator.tagName).toBe('DIV')
    expect(indicator).toHaveClass('loadingIndicator', { exact: true })
    expect(indicator.children).toHaveLength(1)
    expect(svg?.namespaceURI).toBe('http://www.w3.org/2000/svg')
    expect(
      Object.fromEntries(
        svg?.getAttributeNames().map((name) => [name, svg.getAttribute(name)]) ?? [],
      ),
    ).toEqual({
      width: '120',
      height: '134',
      viewBox: '0 0 120 134',
      fill: 'none',
      xmlns: 'http://www.w3.org/2000/svg',
    })
    expect(svg?.children).toHaveLength(1)
    expect(svg?.querySelector('path')).toHaveAttribute('fill', '#FA5022')
    expect(svg?.querySelector('path')?.getAttribute('d')).toMatch(/^M83\.8164 41\.0325C.*Z$/)
  })

  it('should not add text', () => {
    const { indicator } = renderIndicator()

    expect(indicator.textContent?.trim()).toBe('')
  })

  it('should add an extra class after its own', () => {
    const { indicator } = renderIndicator('custom-loader')

    expect([...indicator.classList]).toEqual(['loadingIndicator', 'custom-loader'])
  })

  it('should not add an empty class', () => {
    expect(renderIndicator('').indicator).toHaveClass('loadingIndicator', { exact: true })
  })
})
