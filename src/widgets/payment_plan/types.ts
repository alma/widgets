import {DeepRequired, DOMContent, integer} from "../../types";
import {WidgetSettings} from "../base";
import Eligibility from "alma-js-client/dist/types/entities/eligibility";

export type PaymentPlanWidgetClassesOption = {
  root?: string;
  title?: string;
  paymentPlan?: {
    root?: string;
    installmentsCountWrapper?: string;
    installmentsCountText?: string;
    installmentsWrapper?: string;
    installmentAmount?: string;
  };
  notEligible?: string;
}

export type PaymentPlanWidgetClasses = DeepRequired<PaymentPlanWidgetClassesOption>;

export type PaymentPlanTemplatesOption = {
  title?: (eligiblePlans: any[]) => DOMContent | Element[];
  paymentPlan?: (eligibility: Eligibility, classes: PaymentPlanWidgetClasses) => DOMContent | Element[];
  notEligible?: (minimum: number, maximum: number) => DOMContent | Element[];
}

type PaymentPlanOptions = {
  purchaseAmount: integer;
  installmentsCount: integer | integer[];
  minPurchaseAmount?: integer;
  maxPurchaseAmount?: integer;
  templates?: PaymentPlanTemplatesOption,
  classes?: PaymentPlanWidgetClassesOption;
}

export type PaymentPlanSettings = PaymentPlanOptions & WidgetSettings;
export type PaymentPlanConfig = DeepRequired<PaymentPlanOptions> & WidgetSettings;
