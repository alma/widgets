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

  it('should take the focus', () => {
    renderPlan(mockP3XEligiblePlanWithFees, 'fr')

    expect(screen.getByRole('option')).toHaveAttribute('tabindex', '0')
  })

  it.each([
    ['an eligible', mockP3XEligiblePlanWithFees, 'false'],
    ['an ineligible', mockP4XAboveMaxDisplayPlan, 'true'],
  ])('should set aria-disabled for %s plan', (_kind, plan, ariaDisabled) => {
    renderPlan(plan, 'fr')

    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', ariaDisabled)
  })
})
