import { createQueriesFromPlans } from './utils'

describe('utils', () => {
  describe('createQueriesFromPlans', () => {
    it('should return formatted array to match Queries type', () => {
      const plans = [
        {
          installmentsCount: 1,
          deferredDays: 0,
          deferredMonths: 0,
          minAmount: 50_00,
          maxAmount: 900_00,
        },
        {
          installmentsCount: 1,
          deferredDays: 15,
          deferredMonths: 0,
          minAmount: 50_00,
          maxAmount: 900_00,
        },
        {
          installmentsCount: 1,
          deferredDays: 0,
          deferredMonths: 1,
          minAmount: 50_00,
          maxAmount: 900_00,
        },
        {
          installmentsCount: 10,
          deferredDays: 0,
          deferredMonths: 0,
          minAmount: 50_00,
          maxAmount: 900_00,
        },
        { installmentsCount: 5, deferredDays: 0, minAmount: 50_00, maxAmount: 900_00 },
        { installmentsCount: 3, minAmount: 50_00, maxAmount: 900_00 },
      ]

      const result = createQueriesFromPlans(plans)
      expect(result).toStrictEqual([
        { deferred_days: 0, deferred_months: 0, installments_count: 1 },
        { deferred_days: 15, deferred_months: 0, installments_count: 1 },
        { deferred_days: 0, deferred_months: 1, installments_count: 1 },
        { deferred_days: 0, deferred_months: 0, installments_count: 10 },
        { deferred_days: 0, deferred_months: undefined, installments_count: 5 },
        { deferred_days: undefined, deferred_months: undefined, installments_count: 3 },
      ])
    })
  })
})
