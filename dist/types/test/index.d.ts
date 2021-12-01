import React from 'react';
import { Locale } from 'types';
declare type Props = {
    locale: Locale;
};
declare const renderWithProviders: (ui: React.ReactNode, { locale }?: Props) => React.ReactNode;
export default renderWithProviders;
