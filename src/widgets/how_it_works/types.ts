import {DeepRequired, DOMContent} from "../../types";
import {WidgetSettings} from "../base";
import {IPaymentPlan} from "alma-js-client/dist/types/entities/eligibility";

export type HowItWorksWidgetClassesOption = {
  root?: string;
  logo?: string;
  cta?: string;
  modal?: {
    root?: string;
    wrapper?: string;
    frame?: string;
    closeButton?: string;
    cardLogos?: {
      wrapper?: string;
      logo?: string;
    }
    content?: {
      wrapper?: string;
      logoContainer?: string;
      paymentPlansWrapper?: string;
      paymentPlansButtons?: string;
      paymentPlanButton?: {
        button?: string;
        selected?: string;
        installmentsCount?: string;
      };
      paymentPlanDetailsWrapper?: string;
      creditCardPayment?: string;
      installmentAmount?: string;
      installmentFees?: string;
      installmentDate?: string;
      footer?: {
        wrapper?: string;
        closeButton?: string;
      };
    }
  }
}

export type HowItWorksWidgetClasses = DeepRequired<HowItWorksWidgetClassesOption>;

export type HowItWorksTemplatesOption = {
  logo?: (classes: HowItWorksWidgetClasses) => DOMContent;
  cta?: (openModal: EventHandlerNonNull, classes: HowItWorksWidgetClasses) => DOMContent;
  modal?: (content: DOMContent, closeModal: EventHandlerNonNull, classes: HowItWorksWidgetClasses) => DOMContent;
  modalContent?: (paymentPlans: IPaymentPlan[], closeModal: EventHandlerNonNull, classes: HowItWorksWidgetClasses) => DOMContent;
}

export type HowItWorksTemplates = DeepRequired<HowItWorksTemplatesOption>;

type HowItWorksOptions = {
  templates?: HowItWorksTemplatesOption,
  classes?: HowItWorksWidgetClassesOption;
  displayLogo?: boolean;
  displayInfoIcon?: boolean;
  ctaContent?: DOMContent;
  samplePlans?: IPaymentPlan[];
}

export type HowItWorksSettings = HowItWorksOptions & WidgetSettings;
export type HowItWorksConfig = DeepRequired<HowItWorksOptions> & WidgetSettings;
