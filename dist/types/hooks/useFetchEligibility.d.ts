import { ApiConfig, apiStatusType, ConfigPlan, EligibilityPlan } from 'types';
declare const useFetchEligibility: (purchaseAmount: number, { domain, merchantId }: ApiConfig, plans?: ConfigPlan[] | undefined) => [EligibilityPlan[], apiStatusType];
export default useFetchEligibility;
