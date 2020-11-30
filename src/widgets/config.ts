import isPlainObject from 'lodash.isplainobject'
import { MarkOptional } from 'ts-essentials'

import { DOMContent, IObject, Preserve, PreservedDeepRequired, ResolvePreserve } from '@/types'
import { RenderingFunc } from '@/widgets/types'

/*
 *  *Settings: interfaces for lib consumers
 */
export interface BaseTemplateSettings {
  [K: string]: ((...args: never[]) => DOMContent) | undefined
}

export interface BaseClassesSettings {
  root?: string
}

// Widget Settings are composed of top-level settings + optional template settings & classes settings
export interface BaseWidgetSettings<
  Tpl extends BaseTemplateSettings,
  Cls extends BaseClassesSettings
> {
  container: Preserve<string | HTMLElement>
  render?: RenderingFunc

  templates?: Tpl
  classes?: Cls
}

export type WidgetSettings = BaseWidgetSettings<BaseTemplateSettings, BaseClassesSettings>

export type SettingsLiteral<T> = ResolvePreserve<T>

/*
 *  *Config: "complete" representations of settings for internal use
 */

// A Widget config is derived from its Settings type, making all keys
// required except `render` ()
export type WidgetConfig<T> = T extends BaseWidgetSettings<infer _, infer __>
  ? MarkOptional<PreservedDeepRequired<T>, 'render'>
  : never

// A "default widget config" represents the shape of the default values object used to initialize a
// config. It's the Config type itself, with 'container' marked optional as it does not make a lot of
// sense to have a default value for this property.
export type DefaultWidgetConfig<T> = T extends BaseWidgetSettings<infer _, infer __>
  ? MarkOptional<PreservedDeepRequired<T>, 'render' | 'container'>
  : never

/**
 * Merges a default config object with a settings object, to build a widget's internal config object
 *
 * @param defaults  The default values to use as a base config
 * @param settings  The settings that should override the default values
 *
 * @return WidgetConfig the fully merged config object
 */
export function makeConfig<T extends WidgetSettings>(
  defaults: DefaultWidgetConfig<T>,
  settings: SettingsLiteral<T>
): WidgetConfig<T> {
  const result: WidgetConfig<T> = {} as WidgetConfig<T>
  const sources = [defaults, settings]

  function mergeObjects(base: IObject, source: IObject): IObject {
    for (const key of Object.keys(source)) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        if (isPlainObject(source[key])) {
          if (!base[key] || !isPlainObject(base[key])) {
            base[key] = {}
          }
          mergeObjects(base[key] as IObject, source[key] as IObject)
        } else {
          base[key] = source[key]
        }
      }
    }

    return base
  }

  for (let idx = 0; idx < 2; idx++) {
    const src = sources[idx]
    mergeObjects(result, src as IObject)
  }

  return result
}
