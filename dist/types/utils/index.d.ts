import { integer } from '@/types';
export declare function priceToCents(price: number): integer;
export declare function priceFromCents(cents: integer): number;
export declare function formatCents(cents: integer): string;
export declare function isSameDate(date1: Date, date2: Date): boolean;
export declare function isToday(date: Date): boolean;
export declare function isYesterday(date: Date): boolean;
export declare function humanizedDate(date: Date, addArticle?: boolean, forceDate?: boolean): string;
export declare function addMonths(date: Date, months: integer): Date;
