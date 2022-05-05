import { EligibilityPlan } from 'types';
export declare const mockPlansAllEligible: EligibilityPlan[];
export declare const mockButtonPlans: ({
    customer_total_cost_amount: number;
    customer_total_cost_bps: number;
    deferred_days: number;
    deferred_months: number;
    eligible: boolean;
    installments_count: number;
    payment_plan: {
        customer_fee: number;
        customer_interest: number;
        due_date: number;
        purchase_amount: number;
        total_amount: number;
    }[];
    purchase_amount: number;
    annual_interest_rate?: undefined;
} | {
    annual_interest_rate: number;
    customer_total_cost_amount: number;
    customer_total_cost_bps: number;
    deferred_days: number;
    deferred_months: number;
    eligible: boolean;
    installments_count: number;
    payment_plan: {
        customer_fee: number;
        customer_interest: number;
        due_date: number;
        purchase_amount: number;
        refunded_interest: number;
        total_amount: number;
    }[];
    purchase_amount: number;
})[];
export declare const mockEligibilityPaymentPlanWithIneligiblePlan: ({
    customer_fee: number;
    customer_interest: number;
    customer_total_cost_amount: number;
    customer_total_cost_bps: number;
    deferred_days: number;
    deferred_months: number;
    eligible: boolean;
    installments_count: number;
    payment_plan: {
        customer_fee: number;
        customer_interest: number;
        due_date: number;
        purchase_amount: number;
        total_amount: number;
    }[];
    purchase_amount: number;
    constraints?: undefined;
    reasons?: undefined;
} | {
    constraints: {
        purchase_amount: {
            maximum: number;
            minimum: number;
        };
    };
    deferred_days: number;
    deferred_months: number;
    eligible: boolean;
    installments_count: number;
    purchase_amount: number;
    reasons: {
        purchase_amount: string;
    };
    customer_fee?: undefined;
    customer_interest?: undefined;
    customer_total_cost_amount?: undefined;
    customer_total_cost_bps?: undefined;
    payment_plan?: undefined;
})[];
export declare const mockPlansWithoutDeferred: EligibilityPlan[];
