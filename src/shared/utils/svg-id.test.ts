import { html, render } from 'lit'

import { withSvgId } from '@/shared/utils/svg-id'
import { renderTemplate } from '@/test/render-template'

const gradient = (id: string) => html`<svg><linearGradient id=${id}></linearGradient></svg>`

const gradientIds = (container: Element) =>
  Array.from(container.querySelectorAll('linearGradient'), (element) => element.id)

describe('withSvgId', () => {
  it('should give each use its own ID, starting with the prefix', () => {
    const container = renderTemplate(
      html`${withSvgId('logo', gradient)}${withSvgId('logo', gradient)}`,
    )

    const ids = gradientIds(container)
    expect(ids).toHaveLength(2)
    expect(new Set(ids).size).toBe(2)
    ids.forEach((id) => expect(id).toMatch(/^logo-\d+$/))
  })

  it('should keep the ID across re-renders', () => {
    const template = () => html`${withSvgId('logo', gradient)}`
    const container = renderTemplate(template())
    const [id] = gradientIds(container)

    render(template(), container)

    expect(gradientIds(container)).toEqual([id])
  })
})
