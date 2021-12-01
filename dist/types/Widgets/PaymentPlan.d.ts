import React from 'react';
import { ApiConfig, ConfigPlan } from 'types';
declare type Props = {
    purchaseAmount: number;
    apiData: ApiConfig;
    configPlans?: ConfigPlan[];
    transitionDelay?: number;
    hideIfNotEligible?: boolean;
};
declare const PaymentPlanWidget: React.FC<Props>;
export default PaymentPlanWidget;
