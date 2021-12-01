import { MarkOptional } from 'ts-essentials';
import { DOMContent, Preserve, PreservedDeepRequired, ResolvePreserve } from '@/types';
export interface BaseTemplateSettings {
    [K: string]: ((...args: never[]) => DOMContent) | null | undefined;
}
export interface BaseClassesSettings {
    root?: string;
}
export interface BaseWidgetSettings<Tpl extends BaseTemplateSettings, Cls extends BaseClassesSettings> {
    container: Preserve<string | HTMLElement>;
    templates?: Tpl;
    classes?: Cls;
}
export declare type WidgetSettings = BaseWidgetSettings<BaseTemplateSettings, BaseClassesSettings>;
export declare type SettingsLiteral<T> = ResolvePreserve<T>;
export declare type WidgetConfig<T> = T extends BaseWidgetSettings<infer _, infer __> ? PreservedDeepRequired<T> : never;
export declare type DefaultWidgetConfig<T> = T extends BaseWidgetSettings<infer _, infer __> ? MarkOptional<PreservedDeepRequired<T>, 'container'> : never;
/**
 * Merges a default config object with a settings object, to build a widget's internal config object
 *
 * @param defaults  The default values to use as a base config
 * @param settings  The settings that should override the default values
 *
 * @return WidgetConfig the fully merged config object
 */
export declare function makeConfig<T extends WidgetSettings>(defaults: DefaultWidgetConfig<T>, settings: SettingsLiteral<T>): WidgetConfig<T>;
