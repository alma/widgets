import type { EligibilityPlan } from '../../types'

/**
 * Fixture including both eligible and ineligible plans.
 * Used to validate the "disabled but visible" behavior.
 */
export const ELIGIBILITY_WITH_INELIGIBLE_FIXTURE: EligibilityPlan[] = [
  {
    eligible: true,
    installments_count: 2,
    deferred_days: 0,
    deferred_months: 0,
    purchase_amount: 45000,
    customer_total_cost_amount: 0,
    annual_interest_rate: 0,
    payment_plan: [
      {
        due_date: 1700000000,
        purchase_amount: 22500,
        customer_fee: 0,
        customer_interest: 0,
        total_amount: 22500,
      },
      {
        due_date: 1702600000,
        purchase_amount: 22500,
        customer_fee: 0,
        customer_interest: 0,
        total_amount: 22500,
      },
    ],
  } as EligibilityPlan,
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
    // Ineligible due to purchase amount constraints
    eligible: false,
    installments_count: 4,
    deferred_days: 0,
    deferred_months: 0,
    purchase_amount: 45000,
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    reasons: { purchase_amount: 'invalid_value' },
    constraints: { purchase_amount: { minimum: 900000, maximum: 13500000 } },
  } as EligibilityPlan,
]
