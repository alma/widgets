import React from 'react';
import { ApiConfig, ConfigPlan } from 'types';
declare type Props = {
    purchaseAmount: number;
    apiData: ApiConfig;
    configPlans?: ConfigPlan[];
    onClose: () => void;
};
/**
 * This component allows to display only the modal, without PaymentPlans.
 */
declare const ModalContainer: React.FC<Props>;
export default ModalContainer;
