/// <reference types="react" />
import { integer } from '@/types';
declare type PlansSelectorsProps = {
    installmentsCounts: integer[];
    selectedPlan: integer;
    onSelect: (n: integer) => void;
};
export declare function PlanSelector({ selectedPlan, installmentsCounts, onSelect, }: PlansSelectorsProps): JSX.Element;
export {};
