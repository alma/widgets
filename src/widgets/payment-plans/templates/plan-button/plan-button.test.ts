import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { screen } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockP1XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XAboveMaxDisplayPlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import {
  type PlanButtonParams,
  planButtonTemplate,
} from '@/widgets/payment-plans/templates/plan-button/plan-button.template'

type MessageFixture = {
  locales: Record<string, { messages: Record<string, string | Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// fr_FR holds only a RangeError.
const LOCALES = Object.keys(locales).filter((locale) => locale !== 'fr_FR')

// The fixture's text for a message, with each [placeholder] replaced by its value.
const fixtureText = (locale: string, id: string, values: Record<string, string> = {}) =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`[${name}]`, value),
    locales[locale].messages[id] as string,
  )

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
  describe('short name', () => {
    it.each([
      ['2x', { installments_count: 2, deferred_days: 0, deferred_months: 0 }],
      // The deferred days win over the months.
      ['J+30', { installments_count: 1, deferred_days: 30, deferred_months: 1 }],
    ])('should name the plan %s', (shortName, plan) => {
      renderPlan({ ...mockP1XEligiblePlan, ...plan }, 'fr')

      expect(screen.getByRole('option').textContent).toBe(shortName)
    })

    describe.each(LOCALES)('in %s', (locale) => {
      it.each([
        ['pay now', mockP1XEligiblePlan, 'payment-plan-strings.pay.now.button', {}],
        [
          'deferred days',
          mockPayLater30DaysEligiblePlan,
          'payment-plan-strings.day-abbreviation',
          { deferredDays: '+30' },
        ],
        [
          'deferred months',
          mockPayLaterOneMonthEligiblePlan,
          'payment-plan-strings.month-abbreviation',
          { deferredMonths: '+1' },
        ],
      ])('should name a %s plan as the message fixture does', (_kind, plan, id, values) => {
        renderPlan(plan, locale)

        expect(screen.getByRole('option').textContent).toBe(fixtureText(locale, id, values))
      })
    })
  })

  it.each([true, false])(
    'should render an option described by the info line (isCurrent = %s)',
    (isCurrent) => {
      renderPlan(mockP3XEligiblePlanWithFees, 'fr', { isCurrent })

      const option = screen.getByRole('option', { name: 'Option de paiement 3x' })
      expect(option).toHaveAttribute('aria-selected', String(isCurrent))
      expect(option).toHaveAttribute('aria-describedby', 'payment-info-text')
    },
  )

  it('should render a button that takes the focus', () => {
    renderPlan(mockP3XEligiblePlanWithFees, 'fr')

    expect(screen.getByRole('option')).toHaveAttribute('type', 'button')
    expect(screen.getByRole('option')).toHaveAttribute('tabindex', '0')
  })

  it.each([
    ['an eligible', mockP3XEligiblePlanWithFees, 'false'],
    ['an ineligible', mockP4XAboveMaxDisplayPlan, 'true'],
  ])('should set aria-disabled for %s plan', (_kind, plan, ariaDisabled) => {
    renderPlan(plan, 'fr')

    expect(screen.getByRole('option')).toHaveAttribute('aria-disabled', ariaDisabled)
  })

  it.each([
    [true, true, ['active', 'monochrome']],
    [true, false, ['active']],
    [false, true, []],
  ])(
    'should give only the current plan the monochrome class (isCurrent = %s, monochrome = %s)',
    (isCurrent, monochrome, classes) => {
      renderPlan(mockP3XEligiblePlanWithFees, 'fr', { isCurrent, monochrome })
      const option = screen.getByRole('option')

      for (const className of ['active', 'monochrome']) {
        expect(option.classList.contains(className)).toBe(classes.includes(className))
      }
    },
  )
})
