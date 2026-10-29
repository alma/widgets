import { html, render } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import { withClassName } from '@/shared/ui/class-name'

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
    const container = document.createElement('div')
    const draw = (className: string) =>
      render(html`<p class=${classMap(withClassName('base', className))}></p>`, container)

    draw('one two')
    expect(() => draw('one four')).not.toThrow()
    expect([...container.querySelector('p')!.classList]).toEqual(['base', 'one', 'four'])
  })
})
