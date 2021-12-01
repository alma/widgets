/// <reference types="react" />
import { IEligibility } from '@alma/client/dist/types/entities/eligibility';
export declare const basePillClasses: string[];
declare type PlanPillProps = {
    isActive: boolean;
    eligibility: IEligibility;
    mouseEnterCallback: () => void;
};
export declare function PlanPill({ isActive, eligibility, mouseEnterCallback, }: PlanPillProps): JSX.Element;
export {};
