import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { PaymentPlan } from '@/domain/plans/api/eligibility.types'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { isToday, secondsToMilliseconds } from '@/shared/lib/date'
import { priceFromCents } from '@/shared/lib/price'
import { installmentMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/schedule/installment.module.css'

export interface InstallmentParams {
  installment: PaymentPlan
  index: number
  intl: IntlShape
}

export const installmentTemplate = ({
  installment,
  index,
  intl,
}: InstallmentParams): TemplateResult => {
  const dueDate = secondsToMilliseconds(installment.due_date)
  const date = isToday(dueDate)
    ? html`<strong>${intl.formatMessage(installmentMessages.today)}</strong>`
    : intl.formatDate(dueDate, { day: 'numeric', month: 'long', year: 'numeric' })
  const amount = intl.formatNumber(priceFromCents(installment.total_amount), {
    style: 'currency',
    currency: 'EUR',
  })
  const installmentClasses = classMap({ [styles.installment]: true })
  const dateClasses = classMap({ [styles.date]: true })
  const dotClasses = classMap({ [styles.dot]: true, [styles.isCurrent]: index === 0 })
  // Master renders no class attribute at all on the other rows.
  const amountClass = index === 0 ? styles.bold : undefined
  // No whitespace between the tags, which Prettier would add: master's textContent has none, such
  // as "Aujourd'hui151,35 €".
  // prettier-ignore
  const dateBlock = html`<div class=${dateClasses}><div class=${dotClasses}></div>${date}</div>`
  const amountBlock = html`<div class=${ifDefined(amountClass)}>${amount}</div>`
  // prettier-ignore
  return html`<div class=${installmentClasses} data-testid="installment-${index}">${dateBlock}${amountBlock}</div>`
}
