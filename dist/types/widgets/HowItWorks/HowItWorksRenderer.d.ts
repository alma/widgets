/// <reference types="react" />
import { integer } from '@/types';
import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility';
import { Client } from '@alma/client';
import './styles.scss';
declare type HowItWorksProps = {
    almaClient: Client;
    purchaseAmount: integer;
    installmentsCounts: integer[];
    samplePlans?: IPaymentPlan[];
    closeCallback: () => void;
};
export declare function HowItWorksRenderer({ almaClient, purchaseAmount, installmentsCounts, samplePlans: initialSamplePlans, closeCallback, }: HowItWorksProps): JSX.Element;
export {};
