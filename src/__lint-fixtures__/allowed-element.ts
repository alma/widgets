// expect: nothing
import { html } from 'lit'
import { property } from 'lit/decorators.js'
import { classMap } from 'lit/directives/class-map.js'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { safeCustomElement } from '@/shared/ui/lit/safe-custom-element'

@safeCustomElement('alma-fixture')
export class Fixture extends LightDomElement {
  @property({ type: Boolean }) active = false

  override render() {
    return html`<button class=${classMap({ active: this.active })}>3x</button>`
  }
}

export const dueDate = new Intl.DateTimeFormat('fr', { dateStyle: 'long' })
