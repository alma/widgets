import { html, render } from 'lit'

import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { mockP2XEligiblePlan, mockP3XEligiblePlanWithFees } from '@/test/fixtures'
import { renderTemplate } from '@/test/render-template'
import {
  type PlansContentParams,
  plansContentTemplate,
} from '@/widgets/payment-plans/templates/plans-content.template'

const params = (plans: EligibilityPlanToDisplay[]): PlansContentParams => ({
  plans,
  current: 0,
  isInfoClickable: false,
  info: html``,
  announceText: '',
  onOpenModal: () => {},
  onPlanHover: () => {},
  onPlanLeave: () => {},
  onPlanKeyDown: () => {},
  onPlanClick: () => {},
})

describe('plansContentTemplate', () => {
  it('should keep each plan button with its plan when the plans change, as master keys them', () => {
    const intl = createIntl('fr')
    const p2x = mockP2XEligiblePlan as EligibilityPlanToDisplay
    const p3x = mockP3XEligiblePlanWithFees as EligibilityPlanToDisplay
    const container = renderTemplate(plansContentTemplate(params([p2x, p3x]), intl))
    const [button2x, button3x] = container.querySelectorAll('[role="option"]')

    render(plansContentTemplate(params([p3x, p2x]), intl), container)

    expect([...container.querySelectorAll('[role="option"]')]).toEqual([button3x, button2x])
  })
})
