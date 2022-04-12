import { ApiConfig, apiStatus, ConfigPlan, EligibilityPlan } from 'types';
declare const useFetchEligibility: (purchaseAmount: number, { domain, merchantId }: ApiConfig, plans?: ConfigPlan[] | undefined) => [EligibilityPlan[], apiStatus];
export default useFetchEligibility;
