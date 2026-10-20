import type { MockInstance } from 'vitest'

import { BUILD_VERSION } from '@/shared/config/build-version.const'
import { resetWarnOnce } from '@/shared/lib/errors'
import { ELEMENT_VERSION, safeCustomElement } from '@/shared/ui/lit/safe-custom-element'

// The registry outlives each test, so each test uses its own tag.
describe('safeCustomElement', () => {
  let warn: MockInstance<typeof console.warn>

  beforeEach(() => {
    warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    resetWarnOnce()
    warn.mockRestore()
  })

  it('should define a new tag', () => {
    @safeCustomElement('test-safe-new')
    class NewElement extends HTMLElement {}

    expect(customElements.get('test-safe-new')).toBe(NewElement)
    expect(warn).not.toHaveBeenCalled()
  })

  it('should keep the first class, without a warning, when both carry the same version', () => {
    @safeCustomElement('test-safe-same-version')
    class FirstElement extends HTMLElement {}

    class SecondElement extends HTMLElement {}

    expect(() => safeCustomElement('test-safe-same-version')(SecondElement)).not.toThrow()

    expect(customElements.get('test-safe-same-version')).toBe(FirstElement)
    expect(customElements.get('test-safe-same-version')).not.toBe(SecondElement)
    expect(warn).not.toHaveBeenCalled()
  })

  it.each([
    ['another version', 'test-safe-other-version', '4.6.0', 'with version 4.6.0'],
    ['no version', 'test-safe-no-version', undefined, 'without a version'],
  ])(
    'should keep the first class and warn once when it carries %s',
    (_, tagName, existingVersion, existingDefinition) => {
      class ForeignElement extends HTMLElement {}
      if (existingVersion !== undefined) {
        Object.defineProperty(ForeignElement, ELEMENT_VERSION, { value: existingVersion })
      }
      customElements.define(tagName, ForeignElement)

      class FirstOwnElement extends HTMLElement {}
      class SecondOwnElement extends HTMLElement {}

      expect(() => {
        safeCustomElement(tagName)(FirstOwnElement)
        safeCustomElement(tagName)(SecondOwnElement)
      }).not.toThrow()

      expect(customElements.get(tagName)).toBe(ForeignElement)
      expect(warn).toHaveBeenCalledTimes(1)
      const [message] = warn.mock.calls[0]
      expect(message).toMatch(/^\[Alma widgets\] /)
      expect(message).toContain(`<${tagName}>`)
      expect(message).toContain(existingDefinition)
      expect(message).toContain(`version ${BUILD_VERSION}`)
    },
  )
})
