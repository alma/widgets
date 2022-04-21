import { VoidFunctionComponent } from 'react';
import { ApiConfig, ConfigPlan } from 'types';
declare type Props = {
    purchaseAmount: number;
    apiData: ApiConfig;
    configPlans?: ConfigPlan[];
    transitionDelay?: number;
    hideIfNotEligible?: boolean;
    suggestedPaymentPlan?: number | number[];
};
declare const PaymentPlanWidget: VoidFunctionComponent<Props>;
export default PaymentPlanWidget;
