import { DeepRequired, DOMContent, integer } from '../../types'
import { WidgetSettings } from '../base'
import { EligibleEligibility } from '@alma/client/dist/types/entities/eligibility'
import { WidgetFactoryFunc } from '../types'

export type PaymentPlanWidgetClassesOption = {
  root?: string
  title?: string
  infoButton?: string
  paymentPlan?: {
    root?: string
    installmentsCount?: string
    installmentsWrapper?: string
    installmentAmount?: string
  }
  notEligible?: string
}

export type PaymentPlanWidgetClasses = DeepRequired<PaymentPlanWidgetClassesOption>

export type PaymentPlanTemplatesOption = {
  title?: (
    eligiblePlans: EligibleEligibility[],
    config: PaymentPlanConfig,
    createWidget: WidgetFactoryFunc
  ) => DOMContent
  paymentPlan?: (
    eligibility: EligibleEligibility,
    config: PaymentPlanConfig,
    createWidget: WidgetFactoryFunc
  ) => DOMContent
  notEligible?: (
    min: number,
    max: number,
    installmentsCounts: integer[],
    config: PaymentPlanConfig,
    createWidget: WidgetFactoryFunc
  ) => DOMContent
}

type PaymentPlanOptions = {
  purchaseAmount: integer
  installmentsCount: integer | integer[]
  minPurchaseAmount?: integer
  maxPurchaseAmount?: integer
  templates?: PaymentPlanTemplatesOption
  classes?: PaymentPlanWidgetClassesOption
}

export type PaymentPlanSettings = PaymentPlanOptions & WidgetSettings
export type PaymentPlanConfig = DeepRequired<PaymentPlanOptions> & WidgetSettings
