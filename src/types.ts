import { ApiMode } from 'consts'

export type ApiConfig = { domain: ApiMode; merchantId: string }

export enum widgetTypes {
  PaymentPlans = 'PaymentPlans',
  HowItWorks = 'HowItWorks',
}
export type configPlans = {
  installmentsCount: number
  deferredDays?: number
  deferredMonths?: number
  minAmount: number
  maxAmount: number
}

export type PaymentPlan = {
  customer_fee: number
  customer_interest: number
  due_date: number
  purchase_amount: number
  total_amount: number
}
export type EligibilityPlan = {
  annual_interest_rate?: number
  customer_total_cost_amount: number
  customer_total_cost_bps: number
  deferred_days: number
  deferred_months: number
  eligible: boolean
  installments_count: number
  payment_plan: PaymentPlan[]
  purchase_amount: number
}
export type EligibilityPlanToDisplay = EligibilityPlan & {
  minAmount: number
  maxAmount: number
  eligible: boolean
}
