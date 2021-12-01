import { ConfigPlan, EligibilityPlan, EligibilityPlanToDisplay } from 'types';
declare const filterELigibility: (eligibilities: EligibilityPlan[], configPlans?: ConfigPlan[] | undefined) => EligibilityPlanToDisplay[];
export default filterELigibility;
