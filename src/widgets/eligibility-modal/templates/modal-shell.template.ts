import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import type { IntlShape } from '@/shared/i18n/i18n.types'
import { withClassName } from '@/shared/ui/class-name'
import { crossTemplate } from '@/shared/ui/icons/cross.template'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { modalShellMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/modal-shell.module.css'

export interface ModalShellParams {
  children?: unknown
  onClose: (event: MouseEvent) => void
  contentClassName?: string
  scrollable?: boolean
  intl: IntlShape
}

// What master renders inside react-modal's content div. ModalPortalController renders that div.
export const modalShellTemplate = ({
  children,
  onClose,
  contentClassName,
  scrollable = false,
  intl,
}: ModalShellParams): TemplateResult => {
  const closeButtonClasses = classMap({
    [styles.closeButton]: true,
    [STATIC_CUSTOMISATION_CLASSES.closeButton]: true,
  })
  const contentClasses = classMap({
    ...withClassName(styles.content, contentClassName),
    [styles.contentScrollable]: scrollable,
  })
  const closeLabel = intl.formatMessage(modalShellMessages.closeButtonAriaLabel)
  return html`<div class=${classMap({ [styles.header]: true })}>
      <button
        type="button"
        @click=${onClose}
        class=${closeButtonClasses}
        data-testid="modal-close-button"
        aria-label=${closeLabel}
      >
        ${crossTemplate()}
      </button>
    </div>
    <div class=${contentClasses}>${children}</div>`
}
