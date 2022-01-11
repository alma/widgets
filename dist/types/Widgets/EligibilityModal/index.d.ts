import { FunctionComponent } from 'react';
import { EligibilityPlan } from 'types';
declare type Props = {
    initialPlanIndex?: number;
    onClose: () => void;
    eligibilityPlans: EligibilityPlan[];
};
declare const EligibilityModal: FunctionComponent<Props>;
export default EligibilityModal;
