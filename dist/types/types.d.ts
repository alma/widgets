import { ApiMode } from 'consts';
export declare type ApiConfig = {
    domain: ApiMode;
    merchantId: string;
};
export declare enum widgetTypes {
    PaymentPlans = "PaymentPlans",
    Modal = "Modal"
}
export declare enum apiStatus {
    PENDING = "pending",
    SUCCESS = "success",
    FAILED = "failed"
}
export declare type ConfigPlan = {
    installmentsCount: number;
    deferredDays?: number;
    deferredMonths?: number;
    minAmount: number;
    maxAmount: number;
};
export declare type PaymentPlan = {
    customer_fee: number;
    customer_interest: number;
    due_date: number;
    purchase_amount: number;
    total_amount: number;
    refunded_interest?: number;
};
export declare type EligibilityPlan = {
    annual_interest_rate?: number;
    customer_total_cost_amount: number;
    customer_total_cost_bps: number;
    deferred_days: number;
    deferred_months: number;
    eligible: boolean;
    installments_count: number;
    payment_plan: PaymentPlan[];
    purchase_amount: number;
};
export declare type EligibilityPlanToDisplay = EligibilityPlan & {
    minAmount?: number;
    maxAmount?: number;
};
export declare enum Locale {
    en = "en",
    fr = "fr",
    de = "de",
    it = "it",
    es = "es",
    nl = "nl",
    'nl-NL' = "nl-NL",
    'nl-BE' = "nl-BE"
}
export declare type PaymentPlanWidgetOptions = {
    container: string;
    purchaseAmount: number;
    plans?: ConfigPlan[];
    transitionDelay?: number;
    hideIfNotEligible?: boolean;
    locale?: Locale;
};
export declare type ModalOptions = {
    container: string;
    clickableSelector: string;
    purchaseAmount: number;
    plans?: ConfigPlan[];
    locale?: Locale;
};
export declare type WidgetNames = keyof typeof widgetTypes;
export declare type WidgetOptions = PaymentPlanWidgetOptions | ModalOptions;
