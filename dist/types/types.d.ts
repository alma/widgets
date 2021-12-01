import { AnyArray, Builtin } from 'ts-essentials';
export declare type integer = number;
export { DeepRequired } from 'ts-essentials';
export declare type DOMContent = string | HTMLElement | HTMLElement[];
export interface IObject {
    [key: string]: unknown;
}
export declare type IsObject<T> = T extends AnyArray ? false : T extends object ? true : false;
export declare type Preserve<T> = T & {
    readonly __preserve__: 'preserve';
};
export declare type ResolvePreserve<T> = NonNullable<T> extends Preserve<infer P> ? P : {
    [K in keyof T]: NonNullable<T[K]> extends Builtin ? T[K] : NonNullable<T[K]> extends AnyArray ? T[K] : IsObject<NonNullable<T[K]>> extends true ? ResolvePreserve<T[K]> : T[K];
};
export declare type PreservedDeepRequired<T> = NonNullable<T> extends Preserve<infer P> ? P : {
    [K in keyof T]-?: NonNullable<T[K]> extends Builtin ? T[K] : NonNullable<T[K]> extends AnyArray ? T[K] : IsObject<NonNullable<T[K]>> extends true ? PreservedDeepRequired<T[K]> : T[K];
};
