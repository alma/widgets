/// <reference types="react" />
import { integer } from '@/types';
declare type PlanSelectorProps = {
    n: integer;
    selected: boolean;
    onSelect: (n: integer) => void;
};
export declare function PlanSelectorPlaceholder(): JSX.Element;
export declare function PlanSelectorItem({ n, selected, onSelect }: PlanSelectorProps): JSX.Element;
export {};
