// A single scheduled installment, as returned in `payment_plan` for eligible plans.
export type PaymentPlan = {
  customer_fee: number
  customer_interest: number
  due_date: number
  localized_due_date?: string
  purchase_amount: number
  total_amount: number
}

// Fields present on every eligibility response, regardless of eligibility.
export type EligibilityPlanBase = {
  purchase_amount: number
  installments_count: number
  deferred_days: number
  deferred_months: number
  transaction_country: string
}

// Fields present only on eligible/ineligible responses, respectively — defined once here so
// EligiblePlan/IneligiblePlan and the display type in plans.types.ts can't drift from each other.
export type EligibleOnlyFields = {
  payment_plan: PaymentPlan[]
  customer_fee: number
  customer_interest: number
  customer_total_cost_amount: number
  customer_total_cost_bps: number
  annual_interest_rate?: number
  modulated_first_installment?: boolean
}

export type IneligibleOnlyFields = {
  constraints?: {
    purchase_amount?: { minimum: number; maximum: number }
  }
  reasons: Record<string, string>
}

export type EligiblePlan = EligibilityPlanBase & EligibleOnlyFields & { eligible: true }

export type IneligiblePlan = EligibilityPlanBase & IneligibleOnlyFields & { eligible: false }

// Mirrors the backend's `EligibleResponse | IneligibleResponse` union.
export type EligibilityPlan = EligiblePlan | IneligiblePlan

export type ErrorResponse = {
  message?: string
  error_code?: string
}
