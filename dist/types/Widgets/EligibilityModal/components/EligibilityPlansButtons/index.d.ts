import { FC } from 'react';
import { EligibilityPlan } from 'types';
declare const EligibilityPlansButtons: FC<{
    eligibilityPlans: EligibilityPlan[];
    currentPlanIndex: number;
    setCurrentPlanIndex: (index: number) => void;
}>;
export default EligibilityPlansButtons;
