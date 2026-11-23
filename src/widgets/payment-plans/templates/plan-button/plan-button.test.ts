import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { screen } from '@testing-library/dom'

import type { EligibilityPlanToDisplay } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockP1XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { renderTemplate } from '@/test/utils/render-template'
import { planButtonTemplate } from '@/widgets/payment-plans/templates/plan-button/plan-button.template'

type MessageFixture = {
  locales: Record<string, { messages: Record<string, string | Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// The fixture's text for a message, with each [placeholder] replaced by its value.
const fixtureText = (locale: string, id: string, values: Record<string, string> = {}) =>
  Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`[${name}]`, value),
    locales[locale].messages[id] as string,
  )

const renderPlan = (plan: EligibilityPlanToDisplay, locale: string) =>
  renderTemplate(
    planButtonTemplate(
      {
        plan,
        isCurrent: false,
        onHover: vi.fn(),
        onLeave: vi.fn(),
        onKeyDown: vi.fn(),
        onClick: vi.fn(),
      },
      createIntl(locale),
    ),
  )

describe('planButtonTemplate', () => {
  describe('short name', () => {
    it.each([
      ['2x', { installments_count: 2, deferred_days: 0, deferred_months: 0 }],
      ['12x', { installments_count: 12, deferred_days: 0, deferred_months: 0 }],
      ['Payer maintenant', { installments_count: 1, deferred_days: 0, deferred_months: 0 }],
      ['J+30', { installments_count: 1, deferred_days: 30, deferred_months: 0 }],
      ['M+1', { installments_count: 1, deferred_days: 0, deferred_months: 1 }],
      // The deferred days win over the months.
      ['J+30', { installments_count: 1, deferred_days: 30, deferred_months: 1 }],
    ])('should name the plan %s', (shortName, plan) => {
      renderPlan({ ...mockP1XEligiblePlan, ...plan }, 'fr')

      expect(screen.getByRole('option').textContent).toBe(shortName)
    })

    describe.each(['fr', 'en'])('in %s', (locale) => {
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
})
