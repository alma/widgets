/// <reference types="react" />
import { integer } from '@/types';
import { QueriedPlanProperties } from '@/widgets/PaymentPlans/types';
import { IEligibility } from '@alma/client/dist/types/entities/eligibility';
import { Client } from '@alma/client';
declare type RendererProps = {
    almaClient: Client;
    purchaseAmount: integer;
    queriedPlans: QueriedPlanProperties[];
    results: IEligibility[];
    transitionDelay: number | false;
    error: boolean;
    errorRetryCallback: () => void;
};
export declare function PaymentPlansRenderer({ almaClient, purchaseAmount, queriedPlans, results, transitionDelay, error, errorRetryCallback, }: RendererProps): JSX.Element;
export {};
