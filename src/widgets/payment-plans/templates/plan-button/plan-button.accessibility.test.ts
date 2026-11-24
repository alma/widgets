import { screen } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { mockP3XEligiblePlanWithFees, mockP4XAboveMaxDisplayPlan } from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type PlanButtonParams,
  planButtonTemplate,
} from '@/widgets/payment-plans/templates/plan-button/plan-button.template'

const renderPlan = (
  plan: EligibilityPlanToDisplay,
  locale: string,
  overrides: Partial<PlanButtonParams> = {},
) =>
  renderTemplate(
    planButtonTemplate(
      {
        plan,
        isCurrent: false,
        onHover: vi.fn(),
        onLeave: vi.fn(),
        onKeyDown: vi.fn(),
        onClick: vi.fn(),
        ...overrides,
      },
      createIntl(locale),
    ),
  )

describe('planButtonTemplate', () => {
  it.each([true, false])(
    'should render an option described by the info line (isCurrent = %s)',
    (isCurrent) => {
      renderPlan(mockP3XEligiblePlanWithFees, 'fr', { isCurrent })

      const option = screen.getByRole('option', { name: 'Option de paiement 3x' })
      expect(option).toHaveAttribute('aria-selected', String(isCurrent))
      expect(option).toHaveAttribute('aria-describedby', 'payment-info-text')
    },
  )

  it.each([
    ['an eligible plan', mockP3XEligiblePlanWithFees, false, 'false', '0'],
    ['an ineligible plan', mockP4XAboveMaxDisplayPlan, false, 'true', '-1'],
    // When no plan is eligible, the current plan is an ineligible one.
    ['an ineligible current plan', mockP4XAboveMaxDisplayPlan, true, 'true', '-1'],
  ])(
    'should set aria-disabled and tabindex for %s',
    (_kind, plan, isCurrent, ariaDisabled, tabindex) => {
      renderPlan(plan, 'fr', { isCurrent })

      const option = screen.getByRole('option')
      expect(option).toHaveAttribute('aria-disabled', ariaDisabled)
      expect(option).toHaveAttribute('tabindex', tabindex)
    },
  )
})
