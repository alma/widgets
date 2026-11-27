import { screen, within } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { Locale } from '@/shared/i18n/i18n.const'
import {
  mockP10XEligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP4XEligiblePlanWithFees,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { scheduleTemplate } from '@/widgets/eligibility-modal/templates/schedule/schedule.template'

const renderSchedule = (currentPlan: EligibilityPlanToDisplay, id?: string) =>
  renderTemplate(scheduleTemplate({ currentPlan, id, intl: createIntl(Locale.fr) }))

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string | null) => (text ?? '').replace(/[\u202f\u00a0]/g, ' ')

// The date and the amount of each row.
const rowTexts = () =>
  within(screen.getByTestId('modal-installments-element'))
    .getAllByRole('listitem')
    .map((row) =>
      Array.from(row.firstElementChild?.children ?? [], (cell) => normalize(cell.textContent)),
    )

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

  it.each([
    [
      '4x plan with fees',
      mockP4XEligiblePlanWithFees,
      [
        ["Aujourd'hui", '123,12 €'],
        ['1 janvier 2022', '112,50 €'],
        ['1 février 2022', '112,50 €'],
        ['1 mars 2022', '112,50 €'],
      ],
    ],
    [
      '10x plan',
      mockP10XEligiblePlan,
      [
        ["Aujourd'hui", '47,77 €'],
        ['1 janvier 2022', '47,72 €'],
        ['1 février 2022', '47,72 €'],
        ['1 mars 2022', '47,72 €'],
        ['1 avril 2022', '47,72 €'],
        ['1 mai 2022', '47,72 €'],
        ['1 juin 2022', '47,72 €'],
        ['1 juillet 2022', '47,72 €'],
        ['1 août 2022', '47,72 €'],
        ['1 septembre 2022', '47,72 €'],
      ],
    ],
  ])('should list the date and amount of each installment of the %s', (_name, plan, rows) => {
    renderSchedule(plan)

    expect(rowTexts()).toEqual(rows)
  })

  it('should put the region, title and description IDs on divs', () => {
    renderSchedule(mockP2XEligiblePlan, 'payment-schedule')

    const ids = ['payment-schedule', 'payment-schedule-title', 'payment-schedule-description']
    expect(ids.map((id) => document.getElementById(id)?.localName)).toEqual(['div', 'div', 'div'])
  })

  it('should render the warning message and legal mentions for a Pay Later plan', () => {
    renderSchedule(mockPayLaterOneMonthEligiblePlan)

    expect(
      screen.getByText("Attention ! Un crédit coûte de l'argent et doit être remboursé."),
    ).toBeInTheDocument()
    expect(screen.getByTestId('legal-mentions')).toBeInTheDocument()
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
