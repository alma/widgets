import { FC, ReactNode } from 'react';
import { Locale } from 'types';
declare type Props = {
    children: ReactNode;
    locale: Locale;
};
declare const Provider: FC<Props>;
export default Provider;
