import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { axe } from 'vitest-axe'

import type { EligibilityPlanToDisplay, EligiblePlan } from '@/domain/plans.types'
import { createIntl } from '@/shared/i18n/create-intl'
import { eligiblePlanBuilder } from '@/test/fixtures/plan-builders'
import { mockP4XAboveMaxDisplayPlan, mockP10XEligiblePlan } from '@/test/fixtures/plans'
import { injectStyle } from '@/test/utils/inject-style'
import { renderTemplate } from '@/test/utils/render-template'
import { paymentPlanInfoTextTemplate } from '@/widgets/payment-plans/templates/payment-plan-info-text/payment-plan-info-text.template'

const merchantCss = readFileSync(resolve(__dirname, '../../../../../examples/style.css'), 'utf8')

const renderInfoText = (plan: EligibilityPlanToDisplay, locale = 'fr') =>
  renderTemplate(paymentPlanInfoTextTemplate({ plan, intl: createIntl(locale) }))

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
const payNow = eligiblePlanBuilder().withPurchaseAmount(150_00).withInstallmentsCount(1)
const threeInstallments = eligiblePlanBuilder()
  .withPurchaseAmount(450_00)
  .withInstallmentsCount(3)
  .withFees(1084_50)
const aboveMax = { ...mockP4XAboveMaxDisplayPlan, maxAmount: 150_00 }

describe('paymentPlanInfoTextTemplate', () => {
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
