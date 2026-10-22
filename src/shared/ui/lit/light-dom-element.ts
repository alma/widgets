import { LitElement } from 'lit'

import { warnOnce } from '@/shared/lib/errors'

// Light DOM, so merchant CSS keeps styling the widget.
export class LightDomElement extends LitElement {
  protected override createRenderRoot(): HTMLElement {
    return this
  }

  override connectedCallback(): void {
    super.connectedCallback()
    // Through the CSSOM: a strict style-src CSP blocks the style attribute.
    this.style.display = 'contents'
    // Render before add() returns, as Preact did.
    if (!this.hasUpdated) {
      this.performUpdate()
    }
  }

  // Every update runs here. No exception may reach the merchant's page.
  protected override performUpdate(): void {
    try {
      super.performUpdate()
    } catch (error) {
      warnOnce(`<${this.localName}> could not render.`, error)
    }
  }
}
