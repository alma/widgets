import { FunctionComponent } from 'react';
import { apiStatus, Card, EligibilityPlan } from 'types';
declare type Props = {
    initialPlanIndex?: number;
    onClose: () => void;
    eligibilityPlans: EligibilityPlan[];
    status: apiStatus;
    cards?: Card[];
};
declare const EligibilityModal: FunctionComponent<Props>;
export default EligibilityModal;
