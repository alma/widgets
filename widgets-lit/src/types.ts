export type Locale = (typeof import('./constants').AVAILABLE_LOCALES)[number]

export type Card = 'cb' | 'amex' | 'mastercard' | 'visa'

export interface ConfigPlan {
  installmentsCount: number
  deferredDays?: number
  deferredMonths?: number
  minAmount: number
  maxAmount: number
}

export interface PaymentPlan {
  customer_fee: number
  customer_interest: number
  due_date: number
  purchase_amount: number
  total_amount: number
  refunded_interest?: number
}

export interface EligibilityPlan {
  annual_interest_rate?: number
  customer_total_cost_amount: number
  customer_total_cost_bps: number
  deferred_days: number
  deferred_months: number
  eligible: boolean
  reasons?: Record<string, unknown>
  installments_count: number
  payment_plan?: PaymentPlan[]
  purchase_amount: number
  constraints?: {
    purchase_amount?: { minimum: number; maximum: number }
  }
}

export interface WidgetConfig {
  merchantId: string
  apiMode: string
}

export interface PaymentPlansWidgetAttributes {
  'purchase-amount': number
  locale?: Locale
  plans?: string // JSON stringified ConfigPlan[]
  'hide-if-not-eligible'?: boolean
  monochrome?: boolean
  'hide-border'?: boolean
  cards?: string // JSON stringified Card[]
  'customer-billing-country'?: string
  'customer-shipping-country'?: string
}

export interface ModalWidgetAttributes {
  'purchase-amount': number
  locale?: Locale
  plans?: string // JSON stringified ConfigPlan[]
  cards?: string // JSON stringified Card[]
  'customer-billing-country'?: string
  'customer-shipping-country'?: string
}
