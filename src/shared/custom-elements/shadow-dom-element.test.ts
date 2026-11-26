import { html } from 'lit'
import { property } from 'lit/decorators.js'
import type { MockInstance } from 'vitest'

import { resetWarnOnce } from '@/lib/errors'
import { ShadowDomElement } from '@/shared/custom-elements/shadow-dom-element'

class TestShadowDomElement extends ShadowDomElement {
  protected override render() {
    return html`<p>inside</p>`
  }
}
customElements.define('test-shadow-dom-element', TestShadowDomElement)

class ThrowingShadowDomElement extends ShadowDomElement {
  @property({ attribute: false }) failure: unknown = new Error('broken template')

  protected override render() {
    if (this.failure !== undefined) {
      throw this.failure
    }
    return html`<p>fixed</p>`
  }
}
customElements.define('test-throwing-shadow-dom-element', ThrowingShadowDomElement)

const appendElement = (): TestShadowDomElement => {
  const element = document.createElement('test-shadow-dom-element') as TestShadowDomElement
  document.body.append(element)
  return element
}

const createThrowingElement = (failure: unknown): ThrowingShadowDomElement => {
  const element = document.createElement(
    'test-throwing-shadow-dom-element',
  ) as ThrowingShadowDomElement
  element.failure = failure
  return element
}

describe('ShadowDomElement', () => {
  afterEach(() => {
    resetWarnOnce()
  })

  it('should render into an open shadow root as soon as it is appended', () => {
    const element = appendElement()

    expect(element.shadowRoot?.mode).toBe('open')
    expect(element.shadowRoot?.querySelector('p')).toHaveTextContent('inside')
    expect(element.querySelector('p')).toBeNull()
  })

  it('should set display: contents through the CSSOM, without a style attribute write', () => {
    const setAttribute = vi.spyOn(Element.prototype, 'setAttribute')

    const element = appendElement()

    expect(element.style.display).toBe('contents')
    expect(setAttribute).not.toHaveBeenCalledWith('style', expect.anything())
  })

  describe('when render() throws', () => {
    const message = '[Alma widgets] <test-throwing-shadow-dom-element> could not render.'
    let warn: MockInstance<typeof console.warn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('should warn instead of throwing on the first render', () => {
      const failure = new Error('broken template')
      const element = createThrowingElement(failure)

      expect(() => document.body.append(element)).not.toThrow()
      expect(warn).toHaveBeenCalledWith(message, failure)
    })

    it('should warn instead of rejecting when a later render throws', async () => {
      const element = createThrowingElement(undefined)
      document.body.append(element)
      const failure = new Error('broken later')

      element.failure = failure

      await expect(element.updateComplete).resolves.toBe(true)
      expect(warn).toHaveBeenCalledWith(message, failure)
    })
  })
})
