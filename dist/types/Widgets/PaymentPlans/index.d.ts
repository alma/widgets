import { VoidFunctionComponent } from 'react';
import { ApiConfig, Card, ConfigPlan } from 'types';
declare type Props = {
    purchaseAmount: number;
    apiData: ApiConfig;
    configPlans?: ConfigPlan[];
    transitionDelay?: number;
    customerBillingCountry?: string;
    customerShippingCountry?: string;
    hideIfNotEligible?: boolean;
    monochrome?: boolean;
    suggestedPaymentPlan?: number | number[];
    cards?: Card[];
    hideBorder?: boolean;
};
declare const PaymentPlanWidget: VoidFunctionComponent<Props>;
export default PaymentPlanWidget;
