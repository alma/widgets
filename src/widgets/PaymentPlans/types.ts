import { DOMContent, integer } from '@/types'
import { BaseWidgetSettings } from '../config'
import { IEligibility } from '@alma/client/dist/types/entities/eligibility'
import { BaseClassesSettings, BaseTemplateSettings } from '@/widgets/config'

interface PaymentPlanTemplates extends BaseTemplateSettings {
  planSummary?:
    | ((planProperties: QueriedPlanProperties, results: IEligibility[]) => DOMContent)
    | null
}

export type QueriedPlanProperties = {
  installmentsCount: integer
  deferredMonths?: integer
  deferredDays?: integer
  minAmount: integer
  maxAmount: integer
}

export interface PaymentPlanSettings
  extends BaseWidgetSettings<PaymentPlanTemplates, BaseClassesSettings> {
  purchaseAmount: integer
  plans: QueriedPlanProperties[]
  transitionDelay?: number
}
