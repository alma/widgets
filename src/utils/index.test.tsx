import { FormattedMessage } from 'react-intl'
import { EligibilityPlan } from '../types'
import { priceToCents, formatCents, isP1X } from './index'
import { paymentPlanInfoText, paymentPlanShorthandName } from './paymentPlanStrings'
import React from 'react'
describe('utils', () => {
  it('transform euros in cents', () => {
    expect(priceToCents(100)).toBe(10000)
    expect(priceToCents(200)).toBe(20000)
    expect(priceToCents(1.0)).toBe(100)
    expect(priceToCents(9.99)).toBe(999)
  })

  it('transform cents values into a properly displayed text', () => {
    expect(formatCents(10000)).toBe('100')
    expect(formatCents(100.0)).toBe('1')
    expect(formatCents(100.9)).toBe('1,01')
  })

  describe('paymentPlanShorthandName', () => {
    describe('PNX', () => {
      it.each([
        ['1x', { installments_count: 1, deferred_days: 0, deferred_months: 0 } as EligibilityPlan],
        ['2x', { installments_count: 2, deferred_days: 0, deferred_months: 0 } as EligibilityPlan],
        [
          '12x',
          { installments_count: 12, deferred_days: 0, deferred_months: 0 } as EligibilityPlan,
        ],
      ])('should get the short plan name %s', (result, plan) => {
        expect(paymentPlanShorthandName(plan)).toEqual(result)
      })
      describe('Pay Later', () => {
        
        it('should get the short plan name for deferred days', () => {
          const plan = { installments_count: 1, deferred_days: 30, deferred_months: 0 } as EligibilityPlan
          const result = '+30'
          expect(paymentPlanShorthandName(plan)).toEqual(
            <FormattedMessage
              id="payment-plan-strings.day-abbreviation"
              defaultMessage="J{deferredDays}"
              values={{
                deferredDays: result,
              }}
            />,
          ) 
        })
        it('should get the short plan name for deferred months', () => {
          const plan = { installments_count: 1, deferred_days: 0, deferred_months: 1 } as EligibilityPlan
          const result = '+1'
          expect(paymentPlanShorthandName(plan)).toEqual(
            <FormattedMessage
              id="payment-plan-strings.month-abbreviation"
              defaultMessage="M{deferredMonths}"
              values={{
                deferredMonths: result,
              }}
            />,
          ) 
        })
      })
    })
  })
  it('should throw an error when no payment_plan is provided', () => {
    expect(() =>
      paymentPlanInfoText({
        customer_total_cost_amount: 10,
        customer_total_cost_bps: 10,
        deferred_days: 10,
        deferred_months: 0,
        eligible: true, // This part is important
        installments_count: 10,
        purchase_amount: 1000,
        // Also no payment-plan
      }),
    ).toThrow(
      'No payment plan provided for payment in 10 installments. Please contact us if you see this error.',
    )
  })
  it('should return true if plan is P1X', () => {
    const result = isP1X({
      installments_count: 1,
      deferred_months: 0,
      deferred_days: 0,
    } as EligibilityPlan)
    expect(result).toBe(true)
  })
  it('should return false if plan is not P1X', () => {
    const result1 = isP1X({
      installments_count: 2,
      deferred_months: 0,
      deferred_days: 0,
    } as EligibilityPlan)

    const result2 = isP1X({
      installments_count: 1,
      deferred_months: 1,
      deferred_days: 0,
    } as EligibilityPlan)

    const result3 = isP1X({
      installments_count: 1,
      deferred_months: 0,
      deferred_days: 1,
    } as EligibilityPlan)

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })
})
