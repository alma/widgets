import { DeepRequired, DOMContent, integer } from '@/types'
import { BaseWidgetSettings, WidgetConfig } from '../config'
import { EligibleEligibility } from '@alma/client/dist/types/entities/eligibility'
import { WidgetFactoryFunc } from '../types'
import { BaseClassesSettings, BaseTemplateSettings } from '@/widgets/config'

interface PaymentPlanTemplates extends BaseTemplateSettings {
  title?: (
    eligiblePlans: EligibleEligibility[],
    config: WidgetConfig<PaymentPlanSettings>,
    createWidget: WidgetFactoryFunc
  ) => DOMContent
  paymentPlan?: (
    eligibility: EligibleEligibility,
    config: WidgetConfig<PaymentPlanSettings>,
    createWidget: WidgetFactoryFunc
  ) => DOMContent
  notEligible?: (
    min: number,
    max: number,
    installmentsCounts: integer[],
    config: WidgetConfig<PaymentPlanSettings>,
    createWidget: WidgetFactoryFunc
  ) => DOMContent
}

interface PaymentPlanClasses extends BaseClassesSettings {
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

export type PaymentPlanClassesConfig = DeepRequired<PaymentPlanClasses>

export interface PaymentPlanSettings
  extends BaseWidgetSettings<PaymentPlanTemplates, PaymentPlanClasses> {
  purchaseAmount: integer
  installmentsCount: integer | integer[]
  minPurchaseAmount?: integer | null
  maxPurchaseAmount?: integer | null
}
