import type { Decorator } from '@storybook/web-components-vite'
import { html } from 'lit'
import { action } from 'storybook/actions'

import { createIntl } from '@/shared/i18n/create-intl'
import styles from '@/widgets/eligibility-modal/templates/modal-shell.module.css'
import { modalShellTemplate } from '@/widgets/eligibility-modal/templates/modal-shell.template'

// main.css scopes some rules, .sr-only among them, to the open modal's container.
// 'frame' adds react-modal's overlay and content classes, which place and size the shell and the
// layouts: without the fixed overlay, the mobile modal shifts by the canvas padding.
// 'shell' also wraps the story in the shell, whose header and content div the layouts' CSS relies on.
export const withModalContainer: Decorator = (story, { parameters, globals }) => {
  const { modalContainer } = parameters
  if (!modalContainer) return story()
  if (modalContainer === true) {
    return html`<div id="alma-widget-modal-main-container">${story()}</div>`
  }
  const content =
    modalContainer === 'shell'
      ? modalShellTemplate({
          onClose: action('onClose'),
          scrollable: true,
          children: story(),
          intl: createIntl(globals.locale),
        })
      : story()
  return html`<div class=${styles.overlay}>
    <div id="alma-widget-modal-main-container" class=${styles.modal}>${content}</div>
  </div>`
}
