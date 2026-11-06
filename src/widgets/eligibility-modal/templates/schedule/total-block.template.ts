import { html, type TemplateResult } from 'lit'
import { classMap } from 'lit/directives/class-map.js'

import { isP1X } from '@/domain/plans/plan-kind'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import {
  getAnnualPercentageRate,
  getTotalCreditCost,
  getTotalPurchaseAmount,
} from '@/domain/plans/regulatory-figures'
import type { IntlShape } from '@/shared/i18n/i18n.types'
import { priceFromCents } from '@/shared/lib/price'
import STATIC_CUSTOMISATION_CLASSES from '@/widgets/eligibility-modal/eligibility-modal.const'
import { totalBlockMessages } from '@/widgets/eligibility-modal/eligibility-modal.messages'
import styles from '@/widgets/eligibility-modal/templates/schedule/total-block.module.css'

export interface TotalBlockParams {
  currentPlan: EligibilityPlanToDisplay
  intl: IntlShape
}

const EUR: Intl.NumberFormatOptions = { style: 'currency', currency: 'EUR' }

type ClassInfo = ReturnType<typeof classMap>

const p1xFeesTemplate = (label: string, cost: string, costClasses: ClassInfo) =>
  html`<span>${label}</span><span class=${costClasses}>${cost}</span>`

// Unlike the P1X label, master renders the credit label as a bare text node, with no <span>.
const creditFeesTemplate = (label: string, cost: string, costClasses: ClassInfo) =>
  html`${label}<span class=${costClasses}>${cost}</span>`

export const totalBlockTemplate = ({ currentPlan, intl }: TotalBlockParams): TemplateResult => {
  const total = priceFromCents(getTotalPurchaseAmount(currentPlan))
  const creditCost = intl.formatNumber(priceFromCents(getTotalCreditCost(currentPlan)), EUR)
  const creditCostClasses = classMap({ [styles.creditCost]: true })

  const fees = isP1X(currentPlan)
    ? p1xFeesTemplate(
        intl.formatMessage(totalBlockMessages.totalFees),
        creditCost,
        creditCostClasses,
      )
    : creditFeesTemplate(
        intl.formatMessage(totalBlockMessages.totalCreditCost),
        intl.formatMessage(totalBlockMessages.creditCostDisplay, {
          creditCost,
          annualPercentageRate: intl.formatNumber(getAnnualPercentageRate(currentPlan), {
            style: 'percent',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }),
        }),
        creditCostClasses,
      )

  const containerClasses = classMap({
    [styles.container]: true,
    [STATIC_CUSTOMISATION_CLASSES.summary]: true,
  })
  const totalClasses = classMap({
    [styles.total]: true,
    [STATIC_CUSTOMISATION_CLASSES.scheduleTotal]: true,
  })
  const feesClasses = classMap({
    [styles.fees]: true,
    [STATIC_CUSTOMISATION_CLASSES.scheduleCredit]: true,
  })
  const totalLabel = intl.formatMessage(totalBlockMessages.totalAmount)
  return html`<div class=${containerClasses} data-testid="modal-summary">
    <p class=${totalClasses}><span>${totalLabel}</span>${intl.formatNumber(total || 0, EUR)}</p>
    <p class=${feesClasses}>${fees}</p>
  </div>`
}
