import React from 'react'

import { ApiMode } from '@/consts'

export type ApiConfig = { domain: ApiMode; merchantId: string }

export enum widgetTypes {
  PaymentPlans = 'PaymentPlans',
  Modal = 'Modal',
}
export enum statusResponse {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
}

export type ConfigPlan = {
  installmentsCount: number
  deferredDays?: number
  deferredMonths?: number
  minAmount: number
  maxAmount: number
}

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
// EligiblePlan/IneligiblePlan and the display type below can't drift from each other.
type EligibleOnlyFields = {
  payment_plan: PaymentPlan[]
  customer_fee: number
  customer_interest: number
  customer_total_cost_amount: number
  customer_total_cost_bps: number
  annual_interest_rate?: number
  modulated_first_installment?: boolean
}

type IneligibleOnlyFields = {
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

// filterEligibility() recomputes `eligible` against the merchant's own plan config, so the
// result may no longer match either backend variant's exact field set
export type EligibilityPlanToDisplay = EligibilityPlanBase &
  Partial<EligibleOnlyFields> &
  Partial<IneligibleOnlyFields> & {
    eligible: boolean
    minAmount?: number
    maxAmount?: number
    hidden?: boolean
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
  merchantCoversAllFees?: boolean
  onModalClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
}

export type ModalOptions = {
  container: string
  clickableSelector: string
  purchaseAmount: number
  customerBillingCountry?: string
  customerShippingCountry?: string
  merchantCoversAllFees?: boolean
  plans?: ConfigPlan[]
  locale?: Locale
  cards?: Card[]
  onClose?: (event: React.MouseEvent | React.KeyboardEvent) => void
}

export type WidgetNames = keyof typeof widgetTypes

export type WidgetOptions = PaymentPlanWidgetOptions | ModalOptions
