import { html } from 'lit'
import { property } from 'lit/decorators.js'
import type { MockInstance } from 'vitest'

import { resetWarnOnce } from '@/shared/lib/errors'
import { LightDomElement } from '@/shared/ui/lit/light-dom-element'

class TestLightDomElement extends LightDomElement {
  @property() label = 'first'

  renderCount = 0

  protected override render() {
    this.renderCount += 1
    return html`<p>${this.label}</p>`
  }
}
customElements.define('test-light-dom-element', TestLightDomElement)

class ThrowingLightDomElement extends LightDomElement {
  @property({ attribute: false }) failure: unknown = new Error('broken template')

  protected override render() {
    if (this.failure !== undefined) {
      throw this.failure
    }
    return html`<p>fixed</p>`
  }
}
customElements.define('test-throwing-light-dom-element', ThrowingLightDomElement)

const createThrowingElement = (failure: unknown): ThrowingLightDomElement => {
  const element = document.createElement(
    'test-throwing-light-dom-element',
  ) as ThrowingLightDomElement
  element.failure = failure
  return element
}

const appendElement = (): TestLightDomElement => {
  const element = document.createElement('test-light-dom-element') as TestLightDomElement
  document.body.append(element)
  return element
}

describe('LightDomElement', () => {
  afterEach(() => {
    resetWarnOnce()
    vi.restoreAllMocks()
    document.body.replaceChildren()
  })

  describe('when render() throws', () => {
    const message = '[Alma widgets] <test-throwing-light-dom-element> could not render.'
    let warn: MockInstance<typeof console.warn>

    beforeEach(() => {
      warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    })

    it('should warn with the error instead of throwing on the first render', () => {
      const failure = new Error('broken template')
      const element = createThrowingElement(failure)

      expect(() => document.body.append(element)).not.toThrow()
      expect(warn).toHaveBeenCalledWith(message, failure)
    })

    it('should not throw when the thrown value cannot become a string', () => {
      const failure: unknown = Object.create(null)
      const element = createThrowingElement(failure)

      expect(() => document.body.append(element)).not.toThrow()
      expect(warn).toHaveBeenCalledWith(message, failure)
    })

    it('should not throw again when it is removed and appended after a failed render', () => {
      const element = createThrowingElement(new Error('broken template'))
      document.body.append(element)

      expect(() => {
        element.remove()
        document.body.append(element)
      }).not.toThrow()
      expect(warn).toHaveBeenCalledTimes(1)
    })

    it('should render again once the failure is gone', async () => {
      const element = createThrowingElement(new Error('broken template'))
      document.body.append(element)

      element.failure = undefined
      await element.updateComplete

      expect(element.querySelector('p')?.textContent).toBe('fixed')
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

  it('should render its content in the DOM as soon as it is appended', () => {
    const element = appendElement()

    expect(element.querySelector('p')?.textContent).toBe('first')
  })

  it('should render into the host, not into a shadow root', () => {
    const element = appendElement()

    expect(element.shadowRoot).toBeNull()
    expect(element.renderRoot).toBe(element)
  })

  it('should set display: contents through the CSSOM, without a style attribute write', () => {
    const setAttribute = vi.spyOn(Element.prototype, 'setAttribute')

    const element = appendElement()

    expect(element.style.display).toBe('contents')
    expect(setAttribute).not.toHaveBeenCalledWith('style', expect.anything())
  })

  it('should call render() once for the first update', async () => {
    const element = appendElement()
    await element.updateComplete

    expect(element.renderCount).toBe(1)
  })

  it('should render again after a property change', async () => {
    const element = appendElement()

    element.label = 'second'
    await element.updateComplete

    expect(element.querySelector('p')?.textContent).toBe('second')
  })

  it('should keep display: contents when it is removed and appended again', async () => {
    const element = appendElement()
    await element.updateComplete

    expect(() => {
      element.remove()
      document.body.append(element)
    }).not.toThrow()
    expect(element.style.display).toBe('contents')
    expect(element.renderCount).toBe(1)
  })
})
