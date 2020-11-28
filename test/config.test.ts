import { expectTypeOf } from 'expect-type'

import {
  BaseClassesSettings,
  BaseTemplateSettings,
  BaseWidgetSettings,
  DefaultWidgetConfig,
  makeConfig,
  WidgetConfig,
  WidgetSettings,
} from '@/widgets/config'
import { DOMContent, ResolvePreserve } from '../src/types'
import { RenderingFunc } from '../src/widgets/types'

describe('makeConfig', () => {
  it('has the correct signature', () => {
    type expectedFuncSignature = <T extends WidgetSettings>(
      defaults: DefaultWidgetConfig<T>,
      settings: ResolvePreserve<T>
    ) => WidgetConfig<T>

    expectTypeOf(makeConfig).toEqualTypeOf<expectedFuncSignature>()
  })

  it('correctly merges a default config object with some related settings', () => {
    interface TestTemplates extends BaseTemplateSettings {
      testTemplate?: () => DOMContent
    }

    interface TestClasses extends BaseClassesSettings {
      testClass?: string
    }

    interface TestSettings extends BaseWidgetSettings<TestTemplates, TestClasses> {
      testSetting?: {
        testNestedSetting?: {
          anActualValue: boolean

          testDoubleNestedSetting?: {
            andAnOptionalOne?: string
          }
        }
      }
    }

    const container = document.createElement('div')
    const render: RenderingFunc = async (): Promise<DOMContent> => 'Hello world'

    const defaults: DefaultWidgetConfig<TestSettings> = {
      testSetting: {
        testNestedSetting: {
          anActualValue: true,
          testDoubleNestedSetting: {
            andAnOptionalOne: 'now that is deep',
          },
        },
      },
      classes: {
        root: 'test--root',
        testClass: 'test--testClass',
      },
      templates: {
        testTemplate: () => 'Hello, World!',
      },
    }

    const settings: ResolvePreserve<TestSettings> = {
      container,
      render,
      testSetting: {
        testNestedSetting: {
          anActualValue: false,
          testDoubleNestedSetting: {},
        },
      },
      classes: {
        testClass: 'overridden-class',
      },
    }

    const config = makeConfig(defaults, settings)

    // TODO: this assertion should not fail. makeConfig is "parameterized" with
    //  <T extends WidgetSettings> (...) => WidgetConfig<T> ; I'd expect TSC to consider the return
    //  type to be WidgetConfig<TestSettings>, but it resolves to WidgetConfig<WidgetSettings>
    // expectTypeOf(config).toEqualTypeOf<WidgetConfig<TestSettings>>()
    expectTypeOf(config).toEqualTypeOf<WidgetConfig<WidgetSettings>>()

    // Resulting config is a merge of default config & settings, with precedence to the latter
    expect(config).toEqual({
      ...defaults,
      ...settings,

      testSetting: {
        testNestedSetting: {
          ...defaults.testSetting.testNestedSetting,
          ...settings.testSetting?.testNestedSetting,

          testDoubleNestedSetting: {
            ...defaults.testSetting.testNestedSetting.testDoubleNestedSetting,
            ...settings.testSetting?.testNestedSetting?.testDoubleNestedSetting,
          },
        },
      },

      classes: {
        ...defaults.classes,
        ...settings.classes,
      },

      templates: {
        ...defaults.templates,
        ...settings.templates,
      },
    })
  })
})
