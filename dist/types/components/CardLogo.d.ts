/// <reference types="react" />
declare type CardLogoProps = {
    brand: 'visa' | 'mastercard' | 'cb';
    alt?: string;
};
export declare function CardLogo({ brand, alt }: CardLogoProps): JSX.Element;
export {};
