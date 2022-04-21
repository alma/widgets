import { EligibilityPlan } from 'types';
declare type Args = {
    suggestedPaymentPlan: number | number[];
    eligibilityPlans: EligibilityPlan[];
};
/**
 * It returns the **index** of the **first eligible plan** that matches the default installments count
 *
 * @param {number | number[]} suggestedPaymentPlan
 * @param {EligibilityPlan[]} eligibilityPlans
 * @returns number (index of the first eligible plan that matches the default installments count)
 */
export declare const getIndexOfActivePlan: ({ suggestedPaymentPlan, eligibilityPlans }: Args) => number;
export {};
