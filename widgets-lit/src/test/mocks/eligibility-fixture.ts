import type { EligibilityPlan } from '../../types'

/**
 * Minimal eligibility fixture used by multiple unit test suites.
 * Keep it small and deterministic to avoid brittle UI assertions.
 */
export const ELIGIBILITY_FIXTURE: EligibilityPlan[] = [
  {
    eligible: true,
    installments_count: 3,
    deferred_days: 0,
    deferred_months: 0,
    purchase_amount: 45000,
    customer_total_cost_amount: 0,
    annual_interest_rate: 0,
    payment_plan: [
      {
        due_date: 1700000000,
        purchase_amount: 15000,
        customer_fee: 0,
        customer_interest: 0,
        total_amount: 15000,
      },
      {
        due_date: 1702600000,
        purchase_amount: 15000,
        customer_fee: 0,
        customer_interest: 0,
        total_amount: 15000,
      },
      {
        due_date: 1705200000,
        purchase_amount: 15000,
        customer_fee: 0,
        customer_interest: 0,
        total_amount: 15000,
      },
    ],
  } as EligibilityPlan,
  {
    eligible: true,
    installments_count: 1,
    deferred_days: 15,
    deferred_months: 0,
    purchase_amount: 45000,
    customer_total_cost_amount: 0,
    annual_interest_rate: 0,
    payment_plan: [
      {
        due_date: 1701300000,
        purchase_amount: 45000,
        customer_fee: 0,
        customer_interest: 0,
        total_amount: 45000,
      },
    ],
  } as EligibilityPlan,
]
