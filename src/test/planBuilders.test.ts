import { EligibilityPlan } from '@/types'
import { eligiblePlanBuilder, ineligiblePlanBuilder } from 'test/planBuilders'

describe('eligiblePlanBuilder', () => {
  it('should support the full chain', () => {
    const plan = eligiblePlanBuilder()
      .withPurchaseAmount(45000)
      .withInstallmentsCount(3)
      .withFees(135)
      .withDeferredMonths(1)

    expect(plan.purchase_amount).toBe(45000)
    expect(plan.installments_count).toBe(3)
    expect(plan.payment_plan).toHaveLength(3)
    expect(plan.customer_fee).toBe(135)
    expect(plan.deferred_months).toBe(1)
  })

  it('should be usable directly as an EligiblePlan, with no .build() step', () => {
    const plans: EligibilityPlan[] = [
      eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(1),
    ]

    expect(plans[0].eligible).toBe(true)
  })

  it('should expose only plain data fields, no chain methods, to Object.keys/enumeration', () => {
    const plan = eligiblePlanBuilder()
      .withPurchaseAmount(45000)
      .withInstallmentsCount(3)
      .withFees(135)

    expect(Object.keys(plan)).not.toEqual(
      expect.arrayContaining(['withFees', 'withInstallmentsCount']),
    )
    expect(JSON.parse(JSON.stringify(plan))).not.toHaveProperty('withFees')
  })

  describe('withPurchaseAmount', () => {
    it('should set purchase_amount', () => {
      const plan = eligiblePlanBuilder().withPurchaseAmount(20000)

      expect(plan.purchase_amount).toBe(20000)
    })

    it('should override purchase_amount when called again', () => {
      const plan = eligiblePlanBuilder().withPurchaseAmount(20000).withPurchaseAmount(30000)

      expect(plan.purchase_amount).toBe(30000)
    })
  })

  describe('withInstallmentsCount', () => {
    it('should throw when called before withPurchaseAmount', () => {
      expect(() => eligiblePlanBuilder().withInstallmentsCount(3)).toThrow(/withPurchaseAmount/)
    })

    it('should split the purchase amount evenly across installments', () => {
      const plan = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(3)

      expect(plan.payment_plan.map((installment) => installment.purchase_amount)).toEqual([
        15000, 15000, 15000,
      ])
      expect(plan.payment_plan.map((installment) => installment.total_amount)).toEqual([
        15000, 15000, 15000,
      ])
    })

    it('should put the rounding remainder on the last installment when the amount does not divide evenly', () => {
      const plan = eligiblePlanBuilder().withPurchaseAmount(10000).withInstallmentsCount(3)

      expect(plan.payment_plan.map((installment) => installment.purchase_amount)).toEqual([
        3333, 3333, 3334,
      ])
      const total = plan.payment_plan.reduce(
        (sum, installment) => sum + installment.purchase_amount,
        0,
      )
      expect(total).toBe(10000)
    })

    it('should space due dates one calendar month apart', () => {
      const plan = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(3)

      const [first, second, third] = plan.payment_plan.map((installment) => installment.due_date)
      expect(second - first).toBeGreaterThan(0)
      expect(third - second).toBeGreaterThan(0)
    })

    it('should rebuild the payment plan when called again with a different count', () => {
      const plan = eligiblePlanBuilder()
        .withPurchaseAmount(45000)
        .withInstallmentsCount(2)
        .withInstallmentsCount(3)

      expect(plan.installments_count).toBe(3)
      expect(plan.payment_plan).toHaveLength(3)
    })
  })

  describe('withFees', () => {
    it('should throw when called before withInstallmentsCount', () => {
      expect(() => eligiblePlanBuilder().withPurchaseAmount(45000).withFees(135)).toThrow(
        /withInstallmentsCount/,
      )
    })

    it('should apply the fee only to the first installment', () => {
      const plan = eligiblePlanBuilder()
        .withPurchaseAmount(45000)
        .withInstallmentsCount(3)
        .withFees(135)

      expect(plan.customer_fee).toBe(135)
      expect(plan.payment_plan[0].customer_fee).toBe(135)
      expect(plan.payment_plan[0].total_amount).toBe(15135)
      expect(plan.payment_plan[1].customer_fee).toBe(0)
      expect(plan.payment_plan[2].customer_fee).toBe(0)
    })

    it('should compute customer_total_cost_bps from the fee and purchase amount', () => {
      const plan = eligiblePlanBuilder()
        .withPurchaseAmount(45000)
        .withInstallmentsCount(3)
        .withFees(135)

      expect(plan.customer_total_cost_bps).toBe(30)
      expect(plan.customer_total_cost_amount).toBe(135)
    })
  })

  describe('withDeferredMonths', () => {
    it('should throw when called before withInstallmentsCount', () => {
      expect(() => eligiblePlanBuilder().withPurchaseAmount(45000).withDeferredMonths(1)).toThrow(
        /withInstallmentsCount/,
      )
    })

    it('should shift every installment due date forward and record deferred_months', () => {
      const base = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(2)
      const deferred = base.withDeferredMonths(1)

      expect(deferred.deferred_months).toBe(1)
      deferred.payment_plan.forEach((installment, index) => {
        expect(installment.due_date).toBeGreaterThan(base.payment_plan[index].due_date)
      })
    })
  })

  describe('withDeferredDays', () => {
    it('should throw when called before withInstallmentsCount', () => {
      expect(() => eligiblePlanBuilder().withPurchaseAmount(45000).withDeferredDays(30)).toThrow(
        /withInstallmentsCount/,
      )
    })

    it('should shift every installment due date forward and record deferred_days', () => {
      const base = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(2)
      const deferred = base.withDeferredDays(30)

      expect(deferred.deferred_days).toBe(30)
      deferred.payment_plan.forEach((installment, index) => {
        expect(installment.due_date - base.payment_plan[index].due_date).toBe(30 * 24 * 60 * 60)
      })
    })
  })

  describe('withCountry', () => {
    it('should override transaction_country', () => {
      const plan = eligiblePlanBuilder().withCountry('IT')

      expect(plan.transaction_country).toBe('IT')
    })

    it('should not require installments to be set first', () => {
      expect(() => eligiblePlanBuilder().withCountry('IT')).not.toThrow()
    })
  })

  describe('withInterest', () => {
    it('should throw when called before withInstallmentsCount', () => {
      expect(() => eligiblePlanBuilder().withPurchaseAmount(45000).withInterest(1720)).toThrow(
        /withInstallmentsCount/,
      )
    })

    it('should produce a declining-balance amortization schedule', () => {
      const plan = eligiblePlanBuilder()
        .withPurchaseAmount(45000)
        .withInstallmentsCount(10)
        .withInterest(1720)

      expect(plan.annual_interest_rate).toBe(1720)
      expect(plan.payment_plan).toHaveLength(10)
      // interest decreases and principal increases as the balance is paid down
      expect(plan.payment_plan[0].customer_interest).toBeGreaterThan(
        plan.payment_plan[9].customer_interest,
      )
      expect(plan.payment_plan[0].purchase_amount).toBeLessThan(
        plan.payment_plan[9].purchase_amount,
      )
      // no rounding drift: principal portions sum back to the purchase amount
      const totalPrincipal = plan.payment_plan.reduce(
        (sum, installment) => sum + installment.purchase_amount,
        0,
      )
      expect(totalPrincipal).toBe(45000)
      // customer_interest/customer_total_cost_amount reflect the sum of installment interest
      const totalInterest = plan.payment_plan.reduce(
        (sum, installment) => sum + installment.customer_interest,
        0,
      )
      expect(plan.customer_interest).toBe(totalInterest)
      expect(plan.customer_total_cost_amount).toBe(totalInterest)
    })

    it('should produce no interest for a 0 rate', () => {
      const plan = eligiblePlanBuilder()
        .withPurchaseAmount(45000)
        .withInstallmentsCount(3)
        .withInterest(0)

      expect(plan.payment_plan.every((installment) => installment.customer_interest === 0)).toBe(
        true,
      )
      expect(plan.customer_interest).toBe(0)
    })
  })

  describe('immutability', () => {
    it('should not mutate a builder when deriving a new one from it', () => {
      const base = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(1)

      base.withFees(135)

      expect(base.customer_fee).toBe(0)
    })

    it('should let two branches diverge from the same base without affecting each other', () => {
      const base = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(2)

      const withFees = base.withFees(135)
      const withDeferred = base.withDeferredMonths(1)

      expect(withFees.customer_fee).toBe(135)
      expect(withFees.deferred_months).toBe(0)
      expect(withDeferred.customer_fee).toBe(0)
      expect(withDeferred.deferred_months).toBe(1)
    })

    it('should reject direct property writes', () => {
      const plan = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(1)

      expect(() => {
        plan.purchase_amount = 999
      }).toThrow()
    })

    it('should be order-independent between withFees and withDeferredMonths once installments exist', () => {
      const base = eligiblePlanBuilder().withPurchaseAmount(45000).withInstallmentsCount(2)

      const feesFirst = base.withFees(135).withDeferredMonths(1)
      const deferredFirst = base.withDeferredMonths(1).withFees(135)

      expect(feesFirst.payment_plan.map((installment) => installment.due_date)).toEqual(
        deferredFirst.payment_plan.map((installment) => installment.due_date),
      )
      expect(feesFirst.customer_fee).toBe(deferredFirst.customer_fee)
    })
  })
})

describe('ineligiblePlanBuilder', () => {
  it('should be usable directly as an EligibilityPlan, with no .build() step', () => {
    const plans: EligibilityPlan[] = [ineligiblePlanBuilder()]

    expect(plans[0].eligible).toBe(false)
  })

  it('should start from an empty/uninitialized state', () => {
    const plan = ineligiblePlanBuilder()

    expect(plan.purchase_amount).toBe(0)
    expect(plan.installments_count).toBe(0)
    expect(plan.reasons).toEqual({})
    expect(plan.constraints).toBeUndefined()
  })

  describe('withPurchaseAmount', () => {
    it('should set purchase_amount', () => {
      const plan = ineligiblePlanBuilder().withPurchaseAmount(45000)

      expect(plan.purchase_amount).toBe(45000)
    })
  })

  describe('withInstallmentsCount', () => {
    it('should set installments_count', () => {
      const plan = ineligiblePlanBuilder().withInstallmentsCount(4)

      expect(plan.installments_count).toBe(4)
    })
  })

  describe('withCountry', () => {
    it('should override transaction_country', () => {
      const plan = ineligiblePlanBuilder().withCountry('IT')

      expect(plan.transaction_country).toBe('IT')
    })
  })

  describe('withConstraints', () => {
    it('should set constraints', () => {
      const plan = ineligiblePlanBuilder().withConstraints({
        purchase_amount: { minimum: 9000, maximum: 20000 },
      })

      expect(plan.constraints).toEqual({ purchase_amount: { minimum: 9000, maximum: 20000 } })
    })
  })

  describe('withReasons', () => {
    it('should set reasons', () => {
      const plan = ineligiblePlanBuilder().withReasons({ purchase_amount: 'invalid_value' })

      expect(plan.reasons).toEqual({ purchase_amount: 'invalid_value' })
    })
  })

  describe('immutability', () => {
    it('should not mutate a builder when deriving a new one from it', () => {
      const base = ineligiblePlanBuilder().withPurchaseAmount(45000)

      base.withInstallmentsCount(4)

      expect(base.installments_count).toBe(0)
    })

    it('should reject direct property writes', () => {
      const plan = ineligiblePlanBuilder()

      expect(() => {
        plan.purchase_amount = 999
      }).toThrow()
    })
  })

  it('should support chaining every field together', () => {
    const plan = ineligiblePlanBuilder()
      .withPurchaseAmount(45000)
      .withInstallmentsCount(4)
      .withCountry('BE')
      .withConstraints({ purchase_amount: { minimum: 9000, maximum: 20000 } })
      .withReasons({ purchase_amount: 'invalid_value' })

    expect(plan).toMatchObject({
      purchase_amount: 45000,
      installments_count: 4,
      transaction_country: 'BE',
      constraints: { purchase_amount: { minimum: 9000, maximum: 20000 } },
      reasons: { purchase_amount: 'invalid_value' },
      eligible: false,
    })
  })
})
