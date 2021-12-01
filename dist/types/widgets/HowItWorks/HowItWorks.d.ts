/// <reference types="react" />
import { Widget } from '../Widget';
import { HowItWorksSettings } from './types';
import { DefaultWidgetConfig, SettingsLiteral } from '@/widgets/config';
import { Client } from '@alma/client';
export declare class HowItWorks extends Widget<HowItWorksSettings> {
    private samplePlans;
    private _show;
    defaultConfig(): DefaultWidgetConfig<HowItWorksSettings>;
    constructor(almaClient: Client, settings: SettingsLiteral<HowItWorksSettings>);
    get show(): boolean;
    set show(value: boolean);
    open(): void;
    close(): void;
    protected renderComponent(): Promise<JSX.Element | null>;
}
