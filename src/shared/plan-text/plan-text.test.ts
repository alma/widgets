import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import type { EligibilityPlan } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { paymentPlanShorthandName } from '@/shared/plan-text/plan-text'
import {
  mockP1XEligiblePlan,
  mockPayLater30DaysEligiblePlan,
  mockPayLaterOneMonthEligiblePlan,
} from '@/test/fixtures/plans'

type MessageFixture = {
  locales: Record<string, { messages: Record<string, string | Record<string, string>> }>
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)

// Master's text for a message, with each [placeholder] of the fixture replaced by its value.
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

describe('paymentPlanShorthandName', () => {
  describe('PNX', () => {
    it.each([
      ['2x', { installments_count: 2, deferred_days: 0, deferred_months: 0 } as EligibilityPlan],
      ['12x', { installments_count: 12, deferred_days: 0, deferred_months: 0 } as EligibilityPlan],
    ])('should get the short plan name %s', (result, plan) => {
      expect(paymentPlanShorthandName(plan, fr)).toEqual(result)
    })

    describe('Pay Later', () => {
      it('should display "Pay now" for one installment count and no deferred days or months', () => {
        const plan = {
          installments_count: 1,
          deferred_days: 0,
          deferred_months: 0,
        } as EligibilityPlan

        expect(paymentPlanShorthandName(plan, fr)).toEqual('Payer maintenant')
      })

      it('should get the short plan name for deferred days', () => {
        const plan = {
          installments_count: 1,
          deferred_days: 30,
          deferred_months: 0,
        } as EligibilityPlan

        expect(paymentPlanShorthandName(plan, fr)).toEqual('J+30')
      })

      it('should get the short plan name for deferred months', () => {
        const plan = {
          installments_count: 1,
          deferred_days: 0,
          deferred_months: 1,
        } as EligibilityPlan

        expect(paymentPlanShorthandName(plan, fr)).toEqual('M+1')
      })
    })
  })

  describe.each(['fr', 'en'])('in %s', (locale) => {
    const intl = createIntl(locale)

    it('should match the message fixture for each message', () => {
      expect(paymentPlanShorthandName(mockP1XEligiblePlan, intl)).toBe(
        fixtureText(locale, 'payment-plan-strings.pay.now.button', {}),
      )
      expect(paymentPlanShorthandName(mockPayLater30DaysEligiblePlan, intl)).toBe(
        fixtureText(locale, 'payment-plan-strings.day-abbreviation', { deferredDays: '+30' }),
      )
      expect(paymentPlanShorthandName(mockPayLaterOneMonthEligiblePlan, intl)).toBe(
        fixtureText(locale, 'payment-plan-strings.month-abbreviation', { deferredMonths: '+1' }),
      )
    })
  })
})
