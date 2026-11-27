import { almaLogoTemplate } from '@/shared/templates/alma-logo/alma-logo.template'
import { renderTemplate } from '@/test/utils/render-template'

const attributesHoldingUndefined = (root: Element) =>
  [root, ...root.querySelectorAll('*')].flatMap((element) =>
    element.getAttributeNames().filter((name) => element.getAttribute(name) === 'undefined'),
  )

describe('almaLogoTemplate', () => {
  it('should render the Alma logo without a class or an attribute holding "undefined"', () => {
    const container = renderTemplate(almaLogoTemplate())

    const svg = container.querySelector('svg')
    expect(svg?.hasAttribute('class')).toBe(false)
    expect(attributesHoldingUndefined(container)).toEqual([])
  })
})
