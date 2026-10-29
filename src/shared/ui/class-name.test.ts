import { html, render } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import { withClassName } from '@/shared/ui/class-name'
import { renderTemplate } from '@/test/render-template'

describe('withClassName', () => {
  it('should keep only the base class without a className', () => {
    expect(withClassName('base')).toEqual({ base: true })
    expect(withClassName('base', '')).toEqual({ base: true })
    expect(withClassName('base', '  ')).toEqual({ base: true })
  })

  it('should add each class of the className after the base class', () => {
    expect(Object.keys(withClassName('base', ' one  two '))).toEqual(['base', 'one', 'two'])
  })

  it('should let classMap change a className that holds several classes', () => {
    const template = (className: string) =>
      html`<p class=${classMap(withClassName('base', className))}></p>`

    const container = renderTemplate(template('one two'))
    expect(() => render(template('one four'), container)).not.toThrow()
    expect([...container.querySelector('p')!.classList]).toEqual(['base', 'one', 'four'])
  })
})
