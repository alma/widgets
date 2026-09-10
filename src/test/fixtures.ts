import { ConfigPlan, EligibilityPlan, EligiblePlan, IneligiblePlan, PaymentPlan } from '@/types'

export const mockPaymentPlan = (partials: Partial<PaymentPlan> = {}): PaymentPlan => ({
  customer_fee: 0,
  customer_interest: 0,
  due_date: 1638350762,
  purchase_amount: 45000,
  total_amount: 45000,
  ...partials,
})

export const mockEligiblePlan = (partials: Partial<EligiblePlan> = {}): EligiblePlan => ({
  customer_total_cost_amount: 0,
  customer_total_cost_bps: 0,
  customer_interest: 0,
  customer_fee: 0,
  deferred_days: 0,
  deferred_months: 0,
  eligible: true,
  installments_count: 1,
  payment_plan: [mockPaymentPlan()],
  purchase_amount: 45000,
  transaction_country: 'FR',
  ...partials,
})

export const mockIneligiblePlan = (partials: Partial<IneligiblePlan> = {}): IneligiblePlan => ({
  constraints: { purchase_amount: { maximum: 20000, minimum: 9000 } },
  deferred_days: 0,
  deferred_months: 0,
  eligible: false,
  installments_count: 1,
  purchase_amount: 45000,
  transaction_country: 'FR',
  reasons: { purchase_amount: 'invalid_value' },
  ...partials,
})

export const mockP1XEligiblePlan = mockEligiblePlan()

export const mockPayLaterEligiblePlan = mockEligiblePlan({
  deferred_months: 1,
  payment_plan: [mockPaymentPlan({ due_date: 1641029162 })],
})

export const mockP2XEligiblePlan = mockEligiblePlan({
  installments_count: 2,
  payment_plan: [
    mockPaymentPlan({ due_date: 1638350762, purchase_amount: 22500, total_amount: 22500 }),
    mockPaymentPlan({ due_date: 1641029162, purchase_amount: 22500, total_amount: 22500 }),
  ],
})

export const mockP3XEligiblePlanWithFees = mockEligiblePlan({
  customer_total_cost_amount: 135,
  customer_total_cost_bps: 30,
  customer_fee: 135,
  installments_count: 3,
  payment_plan: [
    mockPaymentPlan({
      customer_fee: 135,
      due_date: 1638350762,
      purchase_amount: 15000,
      total_amount: 15135,
    }),
    mockPaymentPlan({ due_date: 1641029162, purchase_amount: 15000, total_amount: 15000 }),
    mockPaymentPlan({ due_date: 1643707562, purchase_amount: 15000, total_amount: 15000 }),
  ],
})

export const mockP4XEligiblePlanWithFees = mockEligiblePlan({
  customer_total_cost_amount: 1062,
  customer_total_cost_bps: 236,
  customer_fee: 1062,
  installments_count: 4,
  payment_plan: [
    mockPaymentPlan({
      customer_fee: 1062,
      due_date: 1638350762,
      purchase_amount: 11250,
      total_amount: 12312,
    }),
    mockPaymentPlan({ due_date: 1641029162, purchase_amount: 11250, total_amount: 11250 }),
    mockPaymentPlan({ due_date: 1643707562, purchase_amount: 11250, total_amount: 11250 }),
    mockPaymentPlan({ due_date: 1646126762, purchase_amount: 11250, total_amount: 11250 }),
  ],
})

export const mockP10XEligiblePlan = mockEligiblePlan({
  annual_interest_rate: 1720,
  customer_total_cost_amount: 2664,
  customer_total_cost_bps: 592,
  customer_interest: 1720,
  installments_count: 10,
  payment_plan: [
    mockPaymentPlan({ due_date: 1638350762, purchase_amount: 4770, total_amount: 4769 }),
    mockPaymentPlan({
      customer_interest: 493,
      due_date: 1641029162,
      purchase_amount: 4273,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 488,
      due_date: 1643707562,
      purchase_amount: 4278,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 388,
      due_date: 1646126762,
      purchase_amount: 4378,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 370,
      due_date: 1648805162,
      purchase_amount: 4396,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 301,
      due_date: 1651397162,
      purchase_amount: 4465,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 250,
      due_date: 1654075562,
      purchase_amount: 4516,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 183,
      due_date: 1656667562,
      purchase_amount: 4583,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 127,
      due_date: 1659345962,
      purchase_amount: 4639,
      total_amount: 4766,
    }),
    mockPaymentPlan({
      customer_interest: 64,
      due_date: 1662024362,
      purchase_amount: 4702,
      total_amount: 4766,
    }),
  ],
})

export const mockP4XIneligiblePlan = mockIneligiblePlan({
  installments_count: 4,
  reasons: { purchase_amount: 'invalid_value' },
})

export const mockPlansAllEligible: EligibilityPlan[] = [
  mockP1XEligiblePlan,
  mockPayLaterEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
]

export const mockButtonPlans: EligibilityPlan[] = [
  mockPayLaterEligiblePlan,
  mockP1XEligiblePlan,
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
]

export const mockEligibilityPaymentPlanWithIneligiblePlan: EligibilityPlan[] = [
  mockEligiblePlan({
    deferred_days: 30,
    payment_plan: [mockPaymentPlan({ due_date: 1654262242 })],
  }),
  mockEligiblePlan({
    installments_count: 2,
    payment_plan: [
      mockPaymentPlan({ due_date: 1651670242, purchase_amount: 22500, total_amount: 22500 }),
      mockPaymentPlan({ due_date: 1654348642, purchase_amount: 22500, total_amount: 22500 }),
    ],
  }),
  mockIneligiblePlan({ installments_count: 4 }),
  mockIneligiblePlan({
    installments_count: 10,
    constraints: { purchase_amount: { maximum: 135000, minimum: 90000 } },
  }),
]

// Same as mockEligibilityPaymentPlanWithIneligiblePlan but the 4x plan is ineligible due to
// a country restriction (not available in Belgium) — the API returns no purchase_amount constraints,
// so there is nothing useful to display grayed out → the plan should be hidden entirely.
export const mockEligibilityWithHiddenPlan: EligibilityPlan[] = [
  ...mockEligibilityPaymentPlanWithIneligiblePlan.slice(0, 2),
  mockIneligiblePlan({
    installments_count: 4,
    reasons: { installments_count: 'not_allowed' },
    constraints: undefined, // No constraints.purchase_amount → plan is hidden, not grayed out
  }),
]

// 4x plan is ineligible due to purchase_amount range — the API returns constraints.purchase_amount,
// so the widget can display a meaningful "À partir de X€" condition → the plan should be grayed out.
export const mockEligibilityWithGrayedOutPlan: EligibilityPlan[] = [
  ...mockEligibilityPaymentPlanWithIneligiblePlan.slice(0, 2),
  mockIneligiblePlan({
    // constraints.purchase_amount present → plan is grayed out, not hidden
    constraints: { purchase_amount: { maximum: 15000, minimum: 5000 } },
    installments_count: 4,
    reasons: { purchase_amount: 'invalid_value' },
  }),
]

export const mockPlansWithoutDeferred: EligibilityPlan[] = [
  mockP2XEligiblePlan,
  mockP3XEligiblePlanWithFees,
  mockP4XEligiblePlanWithFees,
  mockP10XEligiblePlan,
]

export const mockPayNowPlan: EligibilityPlan[] = [mockP1XEligiblePlan]

export const configPlans: ConfigPlan[] = mockPlansAllEligible.map((plan) => ({
  installmentsCount: plan.installments_count,
  deferredDays: plan.deferred_days,
  deferredMonths: plan.deferred_months,
  minAmount: 90_00,
  maxAmount: 3350_00,
}))

// Deferred (30 days) 3x plan, without customer fees.
export const mockDeferredMultiInstallmentPlanWithoutFees: EligibilityPlan = mockEligiblePlan({
  deferred_days: 30,
  installments_count: 3,
  payment_plan: [
    mockPaymentPlan({ due_date: 1640942762, purchase_amount: 15000, total_amount: 15000 }),
    mockPaymentPlan({ due_date: 1643621162, purchase_amount: 15000, total_amount: 15000 }),
    mockPaymentPlan({ due_date: 1646299562, purchase_amount: 15000, total_amount: 15000 }),
  ],
})

// Same plan as above, with customer fees charged on the first installment.
export const mockDeferredMultiInstallmentPlanWithFees: EligibilityPlan = mockEligiblePlan({
  customer_total_cost_amount: 135,
  customer_total_cost_bps: 30,
  customer_fee: 135,
  deferred_days: 30,
  eligible: true,
  installments_count: 3,
  payment_plan: [
    mockPaymentPlan({
      customer_fee: 135,
      due_date: 1640942762,
      purchase_amount: 15000,
      total_amount: 15135,
    }),
    mockPaymentPlan({ due_date: 1643621162, purchase_amount: 15000, total_amount: 15000 }),
    mockPaymentPlan({ due_date: 1646299562, purchase_amount: 15000, total_amount: 15000 }),
  ],
})

// Deferred P1X: a single installment paid 30 days later (pay later).
export const mockDeferredP1XPlan: EligibilityPlan = mockEligiblePlan({
  deferred_days: 30,
  payment_plan: [mockPaymentPlan({ due_date: 1640942762 })],
})

/**
 * Returns a copy of `plan` with its `transaction_country` overridden.
 * The input plan is never mutated, so shared fixtures stay reusable across tests.
 */
export const withCountry = (plan: EligibilityPlan, countryCode: string): EligibilityPlan => ({
  ...plan,
  transaction_country: countryCode,
})
