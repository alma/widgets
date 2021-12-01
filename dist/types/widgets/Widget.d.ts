/// <reference types="react" />
import { Client } from '@alma/client';
import { DefaultWidgetConfig, SettingsLiteral, WidgetConfig, WidgetSettings } from '@/widgets/config';
export declare type ConstructorFor<T> = T extends Widget<infer SettingsType> ? new (almaClient: Client, settings: SettingsLiteral<SettingsType>) => T : never;
export declare type SettingsFor<T> = T extends Widget<infer SettingsType> ? SettingsLiteral<SettingsType> : never;
export declare abstract class Widget<SettingsType extends WidgetSettings> {
    protected readonly almaClient: Client;
    protected readonly config: WidgetConfig<SettingsType>;
    constructor(almaClient: Client, settings: SettingsLiteral<SettingsType>);
    abstract defaultConfig(): DefaultWidgetConfig<SettingsType>;
    private get container();
    protected abstract renderComponent(): Promise<JSX.Element | null>;
    render(): Promise<void>;
}
