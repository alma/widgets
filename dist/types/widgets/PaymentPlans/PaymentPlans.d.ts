/// <reference types="react" />
import { Widget } from '@/widgets/Widget';
import { Client } from '@alma/client';
import { PaymentPlanSettings } from './types';
import { DefaultWidgetConfig, SettingsLiteral } from '@/widgets/config';
declare type PaymentPlanDefaultConfig = DefaultWidgetConfig<PaymentPlanSettings>;
export declare class PaymentPlans extends Widget<PaymentPlanSettings> {
    private results;
    private loading;
    private fetchError;
    defaultConfig(): PaymentPlanDefaultConfig;
    constructor(almaClient: Client, settings: SettingsLiteral<PaymentPlanSettings>);
    private fetchResults;
    protected renderComponent(): Promise<JSX.Element>;
}
export {};
