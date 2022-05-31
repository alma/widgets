import { VoidFunctionComponent } from 'react';
import { ApiConfig, Card, ConfigPlan } from 'types';
declare type Props = {
    purchaseAmount: number;
    apiData: ApiConfig;
    configPlans?: ConfigPlan[];
    transitionDelay?: number;
    hideIfNotEligible?: boolean;
    monochrome: boolean;
    suggestedPaymentPlan?: number | number[];
    cards?: Card[];
};
declare const PaymentPlanWidget: VoidFunctionComponent<Props>;
export default PaymentPlanWidget;
