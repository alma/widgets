import { ConfigPlan, EligibilityPlan } from 'types'

export const mockPlansAllEligible: EligibilityPlan[] = [
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 1,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1638350762,
        purchase_amount: 45000,
        total_amount: 45000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 1,
    eligible: true,
    installments_count: 1,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1641029162,
        purchase_amount: 45000,
        total_amount: 45000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 2,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1638350762,
        purchase_amount: 22500,
        total_amount: 22500,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1641029162,
        purchase_amount: 22500,
        total_amount: 22500,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 135,
    customer_total_cost_bps: 30,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 3,
    payment_plan: [
      {
        customer_fee: 135,
        customer_interest: 0,
        due_date: 1638350762,
        purchase_amount: 15000,
        total_amount: 15135,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1641029162,
        purchase_amount: 15000,
        total_amount: 15000,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1643707562,
        purchase_amount: 15000,
        total_amount: 15000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 1062,
    customer_total_cost_bps: 236,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 4,
    payment_plan: [
      {
        customer_fee: 1062,
        customer_interest: 0,
        due_date: 1638350762,
        purchase_amount: 11250,
        total_amount: 12312,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1641029162,
        purchase_amount: 11250,
        total_amount: 11250,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1643707562,
        purchase_amount: 11250,
        total_amount: 11250,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1646126762,
        purchase_amount: 11250,
        total_amount: 11250,
      },
    ],
    purchase_amount: 45000,
  },
  {
    annual_interest_rate: 1720,
    customer_total_cost_amount: 2664,
    customer_total_cost_bps: 592,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 10,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1638350762,
        purchase_amount: 4770,
        refunded_interest: 0,
        total_amount: 4769,
      },
      {
        customer_fee: 0,
        customer_interest: 493,
        due_date: 1641029162,
        purchase_amount: 4273,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 488,
        due_date: 1643707562,
        purchase_amount: 4278,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 388,
        due_date: 1646126762,
        purchase_amount: 4378,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 370,
        due_date: 1648805162,
        purchase_amount: 4396,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 301,
        due_date: 1651397162,
        purchase_amount: 4465,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 250,
        due_date: 1654075562,
        purchase_amount: 4516,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 183,
        due_date: 1656667562,
        purchase_amount: 4583,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 127,
        due_date: 1659345962,
        purchase_amount: 4639,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 64,
        due_date: 1662024362,
        purchase_amount: 4702,
        refunded_interest: 0,
        total_amount: 4766,
      },
    ],
    purchase_amount: 45000,
  },
]

export const mockButtonPlans: EligibilityPlan[] = [
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 1,
    eligible: true,
    installments_count: 1,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1637498000, // 21 november 2021
        purchase_amount: 45000,
        total_amount: 45000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 1,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1634819600, // 21 october 2021
        purchase_amount: 45000,
        total_amount: 45000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 2,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1634819600, // 21 october 2021
        purchase_amount: 22500,
        total_amount: 22500,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1637498000, // 21 november 2021
        purchase_amount: 22500,
        total_amount: 22500,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 135,
    customer_total_cost_bps: 30,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 3,
    payment_plan: [
      {
        customer_fee: 135,
        customer_interest: 0,
        due_date: 1634819600, // 21 october 2021
        purchase_amount: 15000,
        total_amount: 15135,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1637498000, // 21 november 2021
        purchase_amount: 15000,
        total_amount: 15000,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1640090000, // 21 december 2021
        purchase_amount: 15000,
        total_amount: 15000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 1202,
    customer_total_cost_bps: 267,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 4,
    payment_plan: [
      {
        customer_fee: 1202,
        customer_interest: 0,
        due_date: 1634819600, // 21 october 2021
        purchase_amount: 11250,
        total_amount: 12452,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1637498000, // 21 november 2021
        purchase_amount: 11250,
        total_amount: 11250,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1640090000, // 21 december 2021
        purchase_amount: 11250,
        total_amount: 11250,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1642768400, // 21 january 2022
        purchase_amount: 11250,
        total_amount: 11250,
      },
    ],
    purchase_amount: 45000,
  },
  {
    annual_interest_rate: 1719,
    customer_total_cost_amount: 2667,
    customer_total_cost_bps: 593,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 10,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1634819600, // 21 october 2021
        purchase_amount: 4773,
        refunded_interest: 0,
        total_amount: 4773,
      },
      {
        customer_fee: 0,
        customer_interest: 492,
        due_date: 1637498000, // 21 november 2021
        purchase_amount: 4274,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 472,
        due_date: 1640090000, // 21 december 2021
        purchase_amount: 4294,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 429,
        due_date: 1642768400, // 21 january 2022
        purchase_amount: 4337,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 371,
        due_date: 1645446800, // 21 february 2022
        purchase_amount: 4395,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 281,
        due_date: 1647866000, // 21 march 2022
        purchase_amount: 4485,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 250,
        due_date: 1650544400, // 21 april 2022
        purchase_amount: 4516,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 183,
        due_date: 1653136400, // 21 may 2022
        purchase_amount: 4583,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 127,
        due_date: 1655814800, // 21 june 2022
        purchase_amount: 4639,
        refunded_interest: 0,
        total_amount: 4766,
      },
      {
        customer_fee: 0,
        customer_interest: 62,
        due_date: 1658406800, // 21 july 2022
        purchase_amount: 4704,
        refunded_interest: 0,
        total_amount: 4766,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 30,
    deferred_months: 0,
    eligible: true,
    installments_count: 1,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1654262242, // 3 june 2022
        purchase_amount: 45000,
        total_amount: 45000,
      },
    ],
    purchase_amount: 45000,
  },
]

export const mockEligibilityPaymentPlanWithIneligiblePlan: EligibilityPlan[] = [
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 30,
    deferred_months: 0,
    eligible: true,
    installments_count: 1,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1654262242,
        purchase_amount: 45000,
        total_amount: 45000,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    deferred_days: 0,
    deferred_months: 0,
    eligible: true,
    installments_count: 2,
    payment_plan: [
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1651670242,
        purchase_amount: 22500,
        total_amount: 22500,
      },
      {
        customer_fee: 0,
        customer_interest: 0,
        due_date: 1654348642,
        purchase_amount: 22500,
        total_amount: 22500,
      },
    ],
    purchase_amount: 45000,
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    constraints: { purchase_amount: { maximum: 20000, minimum: 9000 } },
    deferred_days: 0,
    deferred_months: 0,
    eligible: false,
    installments_count: 4,
    purchase_amount: 45000,
    reasons: { purchase_amount: 'invalid_value' },
  },
  {
    customer_total_cost_amount: 0,
    customer_total_cost_bps: 0,
    constraints: { purchase_amount: { maximum: 135000, minimum: 90000 } },
    deferred_days: 0,
    deferred_months: 0,
    eligible: false,
    installments_count: 10,
    purchase_amount: 45000,
    reasons: { purchase_amount: 'invalid_value' },
  },
]

export const mockPlansWithoutDeferred = mockPlansAllEligible.filter(
  (plan) => plan.deferred_days === 0 && plan.deferred_months === 0 && plan.installments_count >= 2,
)

export const mockPayNowPlan = mockPlansAllEligible.filter(
  (plan) => plan.deferred_days === 0 && plan.deferred_months === 0 && plan.installments_count === 1,
)

export const configPlans: ConfigPlan[] = mockPlansAllEligible.map((plan) => ({
  installmentsCount: plan.installments_count,
  deferredDays: plan.deferred_days,
  deferredMonths: plan.deferred_months,
  minAmount: 90_00,
  maxAmount: 3350_00,
}))
