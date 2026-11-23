import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { EligibilityPlan } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockP1XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP10XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { getPlanDescription } from '@/widgets/payment-plans/utils/plan-description'

type MessageFixture = {
  locales: Record<string, { messages: Record<string, string | Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// The fixture's text for a message, with each [placeholder] replaced by its value.
const fixtureText = (
  locale: string,
  id: string,
  values: Record<string, string>,
  pluralValue?: number,
) => {
  const output = locales[locale].messages[id]
  const text = typeof output === 'string' ? output : output[String(pluralValue)]
  return Object.entries(values).reduce(
    (result, [name, value]) => result.replace(`[${name}]`, value),
    text,
  )
}

const fr = createIntl('fr')

describe('getPlanDescription', () => {
  it.each([
    ['P1X', mockP1XEligiblePlan, 'Payer maintenant'],
    ['Pay Later in months', mockPayLaterOneMonthEligiblePlan, 'Payer en différé : 1 mois'],
    ['Pay Later in days', mockPayLater30DaysEligiblePlan, 'Payer en différé : 30 jours'],
    ['PNX', mockP3XEligiblePlanWithFees, '3x'],
    ['credit', mockP10XEligiblePlan, '10x'],
  ])('should describe a %s plan', (_kind, plan, description) => {
    expect(getPlanDescription(plan, fr)).toBe(description)
  })

  it('should not count a deferred multi-installment plan as Pay Later', () => {
    const plan = { installments_count: 3, deferred_days: 30, deferred_months: 0 } as EligibilityPlan

    expect(getPlanDescription(plan, fr)).toBe('3x')
  })

  describe.each(['fr', 'en'])('in %s', (locale) => {
    const intl = createIntl(locale)
    // The fixture formats the plural messages for 0, 1 and 2.
    const twoDays = { ...mockPayLater30DaysEligiblePlan, deferred_days: 2 }

    it('should match the message fixture for each branch', () => {
      expect(getPlanDescription(mockP1XEligiblePlan, intl)).toBe(
        fixtureText(locale, 'payment-plan-strings.pay.now.button', {}),
      )
      expect(getPlanDescription(mockPayLaterOneMonthEligiblePlan, intl)).toBe(
        fixtureText(locale, 'payment-plan-strings.pay.deferred.button', {
          deferredTime: fixtureText(locale, 'payment-plan-strings.deferred.months', {}, 1),
        }),
      )
      expect(getPlanDescription(twoDays, intl)).toBe(
        fixtureText(locale, 'payment-plan-strings.pay.deferred.button', {
          deferredTime: fixtureText(locale, 'payment-plan-strings.deferred.days', {}, 2),
        }),
      )
    })
  })
})
