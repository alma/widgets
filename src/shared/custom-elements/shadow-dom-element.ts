import { LitElement } from 'lit'

import { warnOnce } from '@/lib/errors'

// Renders in an open shadow root, so the page's CSS rules stop at the widget.
// eslint-disable-next-line no-restricted-syntax -- a base class of shared/custom-elements
export class ShadowDomElement extends LitElement {
  override connectedCallback(): void {
    super.connectedCallback()
    // Through the CSSOM: a strict style-src CSP blocks the style attribute.
    this.style.display = 'contents'
    // Render before add() returns, so merchant code that reads the container
    // right after it finds the widget.
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
