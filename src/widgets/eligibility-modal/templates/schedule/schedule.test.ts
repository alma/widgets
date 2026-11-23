import { screen, within } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP4XEligiblePlanWithFees,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { scheduleTemplate } from '@/widgets/eligibility-modal/templates/schedule/schedule.template'

const renderSchedule = (currentPlan: EligibilityPlanToDisplay) =>
  renderTemplate(scheduleTemplate({ currentPlan, intl: createIntl(Locale.fr) }))

describe('scheduleTemplate', () => {
  it('should render one row per installment', () => {
    renderSchedule(mockP4XEligiblePlanWithFees)

    const rows = within(screen.getByTestId('modal-installments-element')).getAllByRole('listitem')
    expect(rows.map((row) => row.firstElementChild?.getAttribute('data-testid'))).toEqual([
      'installment-0',
      'installment-1',
      'installment-2',
      'installment-3',
    ])
  })

  it('should render the warning message and legal mentions for a plan requiring legal disclosure', () => {
    renderSchedule(mockP2XEligiblePlan)

    expect(
      screen.getByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
    ).toBeInTheDocument()
    expect(screen.getByTestId('legal-mentions')).toBeInTheDocument()
  })

  it('should not render the warning message or legal mentions for a non-deferred P1X plan', () => {
    renderSchedule(mockP1XEligiblePlan)

    expect(screen.getByTestId('modal-installments-element')).toBeInTheDocument()
    expect(
      screen.queryByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
    ).not.toBeInTheDocument()
    expect(screen.queryByTestId('legal-mentions')).not.toBeInTheDocument()
  })

  it('should keep an empty warning container for an unmapped country', () => {
    const container = renderSchedule(mockP2XEligiblePlan.withCountry('ZZ'))

    const warningContainer = container.querySelector('.warningContainer')
    expect(warningContainer).toBeInTheDocument()
    expect(warningContainer?.children).toHaveLength(0)
    expect(warningContainer?.textContent?.trim()).toBe('')
  })
})
