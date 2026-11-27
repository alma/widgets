import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockP1XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'
import { getPlanDescription } from '@/widgets/payment-plans/utils/plan-description'

type MessageFixture = {
  locales: Record<string, { messages: Record<string, string | Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(resolve(__dirname, '../../../test/fixtures/messages.output.json'), 'utf8'),
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
  it('should describe a PNX plan', () => {
    expect(getPlanDescription(mockP3XEligiblePlanWithFees, fr)).toBe('3x')
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
