import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { axe } from 'vitest-axe'

import type { EligiblePlan } from '@/domain/plans/api/eligibility.types'
import type { EligibilityPlanToDisplay } from '@/domain/plans/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import {
  mockP4XAboveMaxDisplayPlan,
  mockP10XBelowMinDisplayPlan,
  mockP10XEligiblePlan,
} from '@/test/fixtures'
import { injectStyle } from '@/test/inject-style'
import { eligiblePlanBuilder, ineligiblePlanBuilder } from '@/test/planBuilders'
import { renderTemplate } from '@/test/render-template'
import { paymentPlanInfoTextTemplate } from '@/widgets/common/plan-strings.template'

type MessageFixture = {
  locales: Record<
    string,
    {
      messages: Record<string, string | Record<string, string>>
      callSites: Record<string, Record<string, string>>
    }
  >
}

const { locales }: MessageFixture = JSON.parse(
  readFileSync(
    resolve(__dirname, '../../../tests/integration/contract/fixtures/messages.output.json'),
    'utf8',
  ),
)
const merchantCss = readFileSync(resolve(__dirname, '../../../examples/style.css'), 'utf8')

// Whether Intl puts U+202F, U+00A0 or a space depends on the ICU version.
const normalize = (text: string) => text.replace(/[\u202f\u00a0]/g, ' ')

const renderInfoText = (plan: EligibilityPlanToDisplay, locale = 'fr') =>
  renderTemplate(paymentPlanInfoTextTemplate({ plan, intl: createIntl(locale) }))

const linesOf = (container: HTMLElement) =>
  [...container.querySelectorAll('p')].map((line) => normalize(line.textContent ?? ''))

// The amounts and dates are inputs of the fixture's call sites.
const dueOn = (plan: EligiblePlan, dueDate: number): EligiblePlan => ({
  ...plan,
  payment_plan: plan.payment_plan.map((installment) => ({ ...installment, due_date: dueDate })),
})
// 1 January 2022, 00:00 UTC
const JANUARY_FIRST = 1640995200
const payLater = dueOn(
  eligiblePlanBuilder().withPurchaseAmount(150_00).withInstallmentsCount(1).withDeferredMonths(1),
  JANUARY_FIRST,
)
const payLaterWithFees = dueOn(
  eligiblePlanBuilder()
    .withPurchaseAmount(1233_15)
    .withInstallmentsCount(1)
    .withDeferredMonths(1)
    .withFees(1_35),
  JANUARY_FIRST,
)
const payNow = eligiblePlanBuilder().withPurchaseAmount(150_00).withInstallmentsCount(1)
const sameAmounts = eligiblePlanBuilder().withPurchaseAmount(450_00).withInstallmentsCount(3)
// The fees make the first installment 1,234.50 € and the others 150 €.
const twoInstallments = eligiblePlanBuilder()
  .withPurchaseAmount(300_00)
  .withInstallmentsCount(2)
  .withFees(1084_50)
const threeInstallments = eligiblePlanBuilder()
  .withPurchaseAmount(450_00)
  .withInstallmentsCount(3)
  .withFees(1084_50)
const aboveMax = { ...mockP4XAboveMaxDisplayPlan, maxAmount: 150_00 }
const belowMin = { ...mockP10XBelowMinDisplayPlan, minAmount: 1234_50 }

const fixtureFor = (locale: string) => {
  const { messages, callSites } = locales[locale]
  const message = (id: string, values: Record<string, string>, pluralValue?: number) => {
    const output = messages[`payment-plan-strings.${id}`]
    const text = typeof output === 'string' ? output : output[String(pluralValue)]
    return Object.entries(values).reduce(
      (result, [name, value]) => result.replace(`[${name}]`, value),
      text,
    )
  }
  const callSite = (id: string, input: number) => callSites[`payment-plan-strings.${id}`][input]
  return { message, callSite, noFee: ` ${message('no-fee', {})}`, knowMore: message('credit', {}) }
}

describe('paymentPlanInfoTextTemplate', () => {
  describe.each(['fr', 'en'])("in %s, like master's messages", (locale) => {
    const { message, callSite, noFee, knowMore } = fixtureFor(locale)

    it.each<[string, EligibilityPlanToDisplay, () => string[]]>([
      [
        'an ineligible plan above its maximum',
        aboveMax,
        () => [
          message('ineligible-greater-than-max', {
            maxAmount: callSite('ineligible-max-amount', 150),
          }),
        ],
      ],
      [
        'an ineligible plan below its minimum',
        belowMin,
        () => [
          message('ineligible-lower-than-min', {
            minAmount: callSite('ineligible-min-amount', 1234.5),
          }),
        ],
      ],
      [
        'a Pay Later plan without fees',
        payLater,
        () => [
          message('deferred', {
            totalAmount: callSite('deferred-total-amount', 150),
            dueDate: callSite('deferred-due-date', JANUARY_FIRST * 1000),
          }) + noFee,
          knowMore,
        ],
      ],
      [
        'a Pay Later plan with fees',
        payLaterWithFees,
        () => [
          message('deferred', {
            totalAmount: callSite('deferred-total-amount', 1234.5),
            dueDate: callSite('deferred-due-date', JANUARY_FIRST * 1000),
          }),
          knowMore,
        ],
      ],
      [
        'a P1X plan',
        payNow,
        () => [message('pay-now', { totalAmount: callSite('pay-now-total-amount', 150) }) + noFee],
      ],
      ['a credit plan', mockP10XEligiblePlan, () => [knowMore]],
      [
        'installments of the same amount',
        sameAmounts,
        () => [
          message('multiple-installments-same-amount', {
            installmentsCount: '3',
            totalAmount: callSite('same-amount-total-amount', 150),
          }) + noFee,
          knowMore,
        ],
      ],
      [
        'two installments of different amounts',
        twoInstallments,
        () => [
          message(
            'multiple-installments',
            {
              firstInstallmentAmount: callSite('first-installment-amount', 1234.5),
              othersInstallmentAmount: callSite('others-installment-amount', 150),
            },
            1,
          ),
          knowMore,
        ],
      ],
      [
        'three installments of different amounts',
        threeInstallments,
        () => [
          message(
            'multiple-installments',
            {
              firstInstallmentAmount: callSite('first-installment-amount', 1234.5),
              othersInstallmentAmount: callSite('others-installment-amount', 150),
            },
            2,
          ),
          knowMore,
        ],
      ],
    ])('should render %s', (_case, plan, expectedLines) => {
      const container = renderInfoText(plan, locale)
      const expected = expectedLines().map(normalize)

      expect(linesOf(container)).toEqual(expected)
      // No whitespace around or between the lines.
      expect(normalize(container.textContent ?? '')).toBe(expected.join(''))
    })
  })

  describe('ineligible plans without amount limits', () => {
    it('should show a maximum of 0 € when the purchase amount is above 0', () => {
      const plan = ineligiblePlanBuilder().withPurchaseAmount(450_00).withInstallmentsCount(4)

      expect(linesOf(renderInfoText(plan))).toEqual(["Jusqu'à 0,00 €"])
    })

    it('should show a minimum of 0 € when the purchase amount is 0', () => {
      const plan = ineligiblePlanBuilder().withInstallmentsCount(4)

      expect(linesOf(renderInfoText(plan))).toEqual(['À partir de 0,00 €'])
    })
  })

  it('should format the amounts in euros whatever the locale', () => {
    expect(linesOf(renderInfoText(payNow, 'en-GB'))).toEqual(['Pay now €150.00 (free of charge)'])
  })

  it('should format the due date as day, full month and year', () => {
    expect(linesOf(renderInfoText(payLater))[0]).toBe(
      '150,00 € à payer le 1 janvier 2022 (sans frais)',
    )
  })

  it("should give the know-more line master's class", () => {
    const [, knowMore] = renderInfoText(sameAmounts).querySelectorAll('p')

    expect(knowMore.className).toBe('openModalInfo')
  })

  it('should not show the know-more line for a P1X plan', () => {
    expect(renderInfoText(payNow).querySelectorAll('p')).toHaveLength(1)
  })

  // The API sends no such plan, but master checks for a legal disclosure before the line.
  it.each([
    ['a negative deferral', { ...payLater, deferred_days: -30, deferred_months: 0 }],
    ['no installments count', { ...payNow, installments_count: 0 }],
  ])('should not show the know-more line for a plan with %s', (_case, plan) => {
    expect(renderInfoText(plan).querySelectorAll('p')).toHaveLength(1)
  })

  it('should throw an error when no payment_plan is provided', () => {
    expect(() =>
      paymentPlanInfoTextTemplate({
        plan: {
          customer_total_cost_amount: 10,
          customer_total_cost_bps: 10,
          customer_interest: 10,
          customer_fee: 0,
          deferred_days: 10,
          deferred_months: 0,
          eligible: true, // This part is important
          installments_count: 10,
          purchase_amount: 1000,
          transaction_country: 'FR',
          // Also no payment-plan
        },
        intl: createIntl('fr'),
      }),
    ).toThrow(
      'No payment plan provided for payment in 10 installments. Please contact us if you see this error.',
    )
  })

  describe.each([
    ['without merchant CSS', false],
    ['with merchant CSS', true],
  ])('%s', (_case, withMerchantCss) => {
    beforeEach(() => {
      if (withMerchantCss) injectStyle(merchantCss)
    })

    it.each([
      ['ineligible', aboveMax],
      ['Pay Later', payLater],
      ['P1X', payNow],
      ['credit', mockP10XEligiblePlan],
      ['PNX', threeInstallments],
    ])('should not have any accessibility violations for a %s plan', async (_kind, plan) => {
      expect(await axe(renderInfoText(plan))).toHaveNoViolations()
    })
  })
})
