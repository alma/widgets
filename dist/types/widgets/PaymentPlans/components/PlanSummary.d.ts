/// <reference types="react" />
import { IEligibility } from '@alma/client/dist/types/entities/eligibility';
import { integer } from '@/types';
declare type PlanSummaryProps = {
    purchaseAmount: integer;
    eligibility: IEligibility;
};
export declare function PlanSummary({ eligibility, purchaseAmount }: PlanSummaryProps): JSX.Element;
export {};
