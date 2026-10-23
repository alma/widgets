import type { Decorator } from '@storybook/web-components-vite'
import { html } from 'lit'

// main.css scopes some rules, .sr-only among them, to the open modal's container.
export const withModalContainer: Decorator = (story, { parameters }) =>
  parameters.modalContainer
    ? html`<div id="alma-widget-modal-main-container">${story()}</div>`
    : story()
