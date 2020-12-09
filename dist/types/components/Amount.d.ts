/// <reference types="react" />
import { integer } from '@/types';
declare type AmountProps = {
    className?: string;
    cents: integer;
    currency?: string;
};
export declare function Amount({ className, cents, currency }: AmountProps): JSX.Element;
export {};
