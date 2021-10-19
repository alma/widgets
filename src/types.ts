import { ApiMode } from 'consts'

export type ApiConfig = { domain: ApiMode; merchantId: string }

export type PaymentPlan = {
  customer_fee: number
  customer_interest: number
  due_date: number
  purchase_amount: number
  total_amount: number
}
export type EligibilityPlan = {
  customer_total_cost_amount: number
  customer_total_cost_bps: number
  deferred_days: number
  deferred_months: number
  eligible: boolean
  installments_count: number
  payment_plan: PaymentPlan[]
  purchase_amount: number
}
