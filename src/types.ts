import { ApiMode } from 'consts'

export type ApiConfig = { domain: ApiMode; merchantId: string }

export enum widgetTypes {
  PaymentPlans = 'PaymentPlans',
  HowItWorks = 'HowItWorks',
}
export enum apiStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}
export type apiStatusType = apiStatus.PENDING | apiStatus.SUCCESS | apiStatus.FAILED

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
  refunded_interest?: number
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

export enum Locale {
  en = 'en',
  fr = 'fr',
  de = 'de',
  it = 'it',
  es = 'es',
  'nl-NL' = 'nl-NL',
  'nl-BE' = 'nl-BE',
}

export type PaymentPlanWidgetOptions = {
  container: string
  purchaseAmount: number
  plans?: configPlans[]
  transitionDelay?: number
  hideIfNotEligible?: boolean
  locale?: Locale
}

export type HowItWorksWidgetOptions = {
  container: string
}

export type WidgetNames = widgetTypes.PaymentPlans | widgetTypes.HowItWorks

export type WidgetName<T> = T extends widgetTypes.PaymentPlans
  ? widgetTypes.PaymentPlans
  : T extends widgetTypes.HowItWorks
  ? widgetTypes.HowItWorks
  : never
export type WidgetOptions<T> = T extends widgetTypes.PaymentPlans
  ? PaymentPlanWidgetOptions
  : T extends widgetTypes.HowItWorks
  ? HowItWorksWidgetOptions
  : never
