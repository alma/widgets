import { FC } from 'react';
import { EligibilityPlan } from 'types';
declare type Props = {
    eligibilityPlans: EligibilityPlan[];
    currentPlanIndex: number;
    setCurrentPlanIndex: (index: number) => void;
    currentPlan: EligibilityPlan;
};
declare const DesktopModal: FC<Props>;
export default DesktopModal;
