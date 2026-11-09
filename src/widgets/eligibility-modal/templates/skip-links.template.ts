import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import type { IntlShape, MessageDescriptor } from '@/shared/i18n/i18n.types'
import { skipLinksMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/skip-links.module.css'

export interface SkipLink {
  href: string
  labelId: string
  defaultMessage: string
}

export interface SkipLinksParams {
  skipLinks: SkipLink[]
  className?: string
  intl: IntlShape
}

const handleSkipLinkClick = (event: MouseEvent) => {
  const href = (event.currentTarget as HTMLAnchorElement).getAttribute('href')
  if (!href?.startsWith('#')) {
    return
  }
  const targetElement = document.getElementById(href.substring(1))
  if (!targetElement) {
    return
  }
  // Small delay to allow browser to scroll first
  setTimeout(() => {
    targetElement.focus()
  }, 0)
}

const skipLinkTemplate = ({ href, labelId, defaultMessage }: SkipLink, intl: IntlShape) => {
  // A variable, not an object literal, so `formatjs extract` skips this runtime id.
  const label: MessageDescriptor = { id: labelId, defaultMessage }
  const linkClasses = classMap({ [styles.skipLink]: true })
  const text = intl.formatMessage(label)
  return html`<li class=${classMap({ [styles.skipLinkItem]: true })}>
    <a href=${href} class=${linkClasses} @click=${handleSkipLinkClick}>${text}</a>
  </li>`
}

export const skipLinksTemplate = ({
  skipLinks,
  className,
  intl,
}: SkipLinksParams): TemplateResult => {
  const classes = classMap({
    [styles.skipLinks]: true,
    ...(className ? { [className]: true } : {}),
  })
  const ariaLabel = intl.formatMessage(skipLinksMessages.navigationAriaLabel)
  return html`<nav class=${classes} role="navigation" aria-label=${ariaLabel}>
    <ul class=${classMap({ [styles.skipLinksList]: true })}>
      ${skipLinks.map((skipLink) => skipLinkTemplate(skipLink, intl))}
    </ul>
  </nav>`
}
