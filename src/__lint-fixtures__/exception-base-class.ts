// path: src/shared/ui/lit/light-dom-element.ts
// expect: no-restricted-syntax "No attachShadow"
import { LitElement } from 'lit'

export class LightDomElement extends LitElement {
  protected override createRenderRoot() {
    return this.attachShadow({ mode: 'open' })
  }
}
