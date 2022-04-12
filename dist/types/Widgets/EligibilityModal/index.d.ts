import { FunctionComponent } from 'react';
import { apiStatus, EligibilityPlan } from 'types';
declare type Props = {
    initialPlanIndex?: number;
    onClose: () => void;
    eligibilityPlans: EligibilityPlan[];
    status: apiStatus;
};
declare const EligibilityModal: FunctionComponent<Props>;
export default EligibilityModal;
