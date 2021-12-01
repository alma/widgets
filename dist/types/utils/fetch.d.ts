import { EligibilityPlan } from 'types';
export declare function fetchFromApi(url: string | undefined, data: {
    [key: string]: unknown;
}, headers?: {
    [key: string]: unknown;
}): Promise<EligibilityPlan[]>;
