import React from 'react';
import { ApiConfig, Card, ConfigPlan } from 'types';
declare type Props = {
    purchaseAmount: number;
    apiData: ApiConfig;
    configPlans?: ConfigPlan[];
    customerBillingCountry?: string;
    customerShippingCountry?: string;
    onClose: () => void;
    cards?: Card[];
};
/**
 * This component allows to display only the modal, without PaymentPlans.
 */
declare const ModalContainer: React.FC<Props>;
export default ModalContainer;
