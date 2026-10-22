import type { Meta, StoryObj } from '@storybook/web-components-vite'
import { html } from 'lit'

import { LightDomElement } from '@/shared/ui/lit/light-dom-element'
import { safeCustomElement } from '@/shared/ui/lit/safe-custom-element'

// A placeholder until the first template stories land.
@safeCustomElement('alma-storybook-placeholder')
export class StorybookPlaceholder extends LightDomElement {
  override render() {
    return html`<p>
      This text renders in light DOM, inside &lt;alma-storybook-placeholder&gt;, with no shadow
      root, so main.css and merchant CSS reach it.
    </p>`
  }
}

const meta: Meta = {
  excludeStories: ['StorybookPlaceholder'],
  render: () => html`<alma-storybook-placeholder></alma-storybook-placeholder>`,
}

export default meta

export const Placeholder: StoryObj = {}

export const InsideModalContainer: StoryObj = {
  parameters: { modalContainer: true },
}
