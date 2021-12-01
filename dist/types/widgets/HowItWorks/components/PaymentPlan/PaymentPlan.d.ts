/// <reference types="react" />
import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility';
export declare type PlanDetailsProps = {
    plan: IPaymentPlan | null;
};
export declare function PaymentPlan({ plan }: PlanDetailsProps): JSX.Element;
