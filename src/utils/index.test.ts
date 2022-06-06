import { priceToCents, formatCents } from './index'
import { paymentPlanInfoText } from './paymentPlanStrings'
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
