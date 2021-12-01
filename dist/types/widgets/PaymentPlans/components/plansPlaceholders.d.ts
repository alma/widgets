/// <reference types="react" />
import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types';
declare type PlansPlaceholderProps = {
    error: boolean;
    queriedPlans: QueriedPlanProperties[];
    errorRetryCallback: () => void;
};
export declare function plansPlaceholders({ error, queriedPlans, errorRetryCallback, }: PlansPlaceholderProps): {
    planPills: JSX.Element[];
    planSummary: JSX.Element;
};
export {};
