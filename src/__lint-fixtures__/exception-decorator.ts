// path: src/shared/ui/lit/safe-custom-element.ts
// expect: no-restricted-syntax "No CustomEvent"
import { customElement } from 'lit/decorators.js'

export const safeCustomElement = (tagName: string) => (elementClass: CustomElementConstructor) => {
  customElements.define(tagName, elementClass)
  window.dispatchEvent(new CustomEvent('alma-defined'))
}

@customElement('alma-fixture')
export class Fixture extends HTMLElement {}
