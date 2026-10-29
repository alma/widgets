import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import { withClassName } from '@/shared/ui/class-name'
import styles from '@/widgets/payment-plans/templates/loader.module.css'

export const loaderTemplate = ({ className }: { className?: string } = {}): TemplateResult =>
  html`<div
    class=${classMap(withClassName(styles.loadingIndicator, className))}
    data-testid="loader"
  >
    <div class=${styles.line1}></div>
    <div class=${styles.line2}></div>
  </div>`
