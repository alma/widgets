import { crossTemplate } from '@/shared/templates/icons/cross.template'
import { renderTemplate } from '@/test/utils/render-template'

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

describe('crossTemplate', () => {
  it('should render the cross without a class or an attribute holding "undefined"', () => {
    const container = renderTemplate(crossTemplate())

    const svg = container.querySelector('svg')
    expect(svg?.hasAttribute('class')).toBe(false)
    expect(attributesHoldingUndefined(container)).toEqual([])
  })
})
