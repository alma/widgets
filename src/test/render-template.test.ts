import { html } from 'lit'

import { renderTemplate } from '@/test/render-template'

describe('renderTemplate', () => {
  it('should render the template in a container in <body>', () => {
    const container = renderTemplate(html`<p>text</p>`)

    expect(container.parentElement).toBe(document.body)
    expect(container.querySelector('p')?.textContent).toBe('text')
  })
})
