import { ApiMode } from 'consts'
import React from 'react'

export type ApiConfig = { domain: ApiMode; merchantId: string }

export enum widgetTypes {
  PaymentPlans = 'PaymentPlans',
  Modal = 'Modal',
}
export enum apiStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  CACHE_SUCCESS = 'cache_success',
}

export type ConfigPlan = {
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
  reasons?: Record<string, unknown>
  installments_count: number
  payment_plan?: PaymentPlan[]
  purchase_amount: number
  constraints?: {
    purchase_amount?: { minimum: number; maximum: number }
  }
}

export type EligibilityPlanToDisplay = EligibilityPlan & {
  minAmount?: number
  maxAmount?: number
}

export enum Locale {
  en = 'en',
  'fr-FR' = 'fr-FR',
  fr = 'fr',
  'de-DE' = 'de-DE',
  de = 'de',
  it = 'it',
  'it-IT' = 'it-IT',
  es = 'es',
  'es-ES' = 'es-ES',
  pt = 'pt',
  'pt-PT' = 'pt-PT',
  nl = 'nl',
  'nl-NL' = 'nl-NL',
  'nl-BE' = 'nl-BE',
}

export type Card = 'cb' | 'amex' | 'mastercard' | 'visa'

export type PaymentPlanWidgetOptions = {
  container: string
  hideIfNotEligible?: boolean
  locale?: Locale
  cards?: Card[]
  monochrome?: boolean
  plans?: ConfigPlan[]
  purchaseAmount: number
  suggestedPaymentPlan?: number | number[]
  transitionDelay?: number
  hideBorder?: boolean
  customerBillingCountry?: string
  customerShippingCountry?: string
  onModalClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
}

export type ModalOptions = {
  container: string
  clickableSelector: string
  purchaseAmount: number
  customerBillingCountry?: string
  customerShippingCountry?: string
  plans?: ConfigPlan[]
  locale?: Locale
  cards?: Card[]
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
}

export type WidgetNames = keyof typeof widgetTypes

export type WidgetOptions = PaymentPlanWidgetOptions | ModalOptions
