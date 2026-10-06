import type { ConfigPlan } from '@/domain/plans/plans.types'
import type { ApiMode, WidgetTypes } from '@/public-api/public-api.const'
import type { Locale } from '@/shared/i18n/i18n.const'
import type { Card } from '@/shared/ui/icons/cards/cards.types'

export type ApiConfig = { domain: ApiMode; merchantId: string }

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
  onModalClose?: (event: MouseEvent | KeyboardEvent) => void
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
  onClose?: (event: MouseEvent | KeyboardEvent) => void
}

export type WidgetNames = keyof typeof WidgetTypes

export type WidgetOptions = PaymentPlanWidgetOptions | ModalOptions
