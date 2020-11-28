import { DOMContent } from '@/types'
import { BaseClassesSettings, BaseTemplateSettings, BaseWidgetSettings } from '../config'
import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility'
import { DeepRequired } from 'ts-essentials'

interface HIWClasses extends BaseClassesSettings {
  logo?: string
  cta?: string
  modal?: {
    root?: string
    wrapper?: string
    frame?: string
    closeButton?: string
    cardLogos?: {
      wrapper?: string
      logo?: string
    }
    content?: {
      wrapper?: string
      logoContainer?: string
      paymentPlansWrapper?: string
      paymentPlansButtons?: string
      paymentPlanButton?: {
        button?: string
        selected?: string
        installmentsCount?: string
      }
      paymentPlanDetailsWrapper?: string
      creditCardPayment?: string
      installmentAmount?: string
      installmentFees?: string
      installmentDate?: string
      footer?: {
        wrapper?: string
        closeButton?: string
      }
    }
  }
}

export type HowItWorksClassesConfig = DeepRequired<HIWClasses>

interface HIWTemplates extends BaseTemplateSettings {
  logo?: (classes: HowItWorksClassesConfig) => DOMContent
  cta?: (openModal: EventHandlerNonNull, classes: HowItWorksClassesConfig) => DOMContent
  modal?: (
    content: DOMContent,
    closeModal: EventHandlerNonNull,
    classes: HowItWorksClassesConfig
  ) => DOMContent
  modalContent?: (
    paymentPlans: IPaymentPlan[],
    closeModal: EventHandlerNonNull,
    classes: HowItWorksClassesConfig
  ) => DOMContent
}

export type HowItWorksTemplatesConfig = DeepRequired<HIWTemplates>

export interface HowItWorksSettings extends BaseWidgetSettings<HIWTemplates, HIWClasses> {
  displayLogo?: boolean
  displayInfoIcon?: boolean
  ctaContent?: DOMContent
  samplePlans?: IPaymentPlan[]
}
