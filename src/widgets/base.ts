import { DOMContent, ResolvePreserve } from '@/types'
import { Client } from '@alma/client'
import { setDOMContent } from '@/utils'
import WidgetsController from '../widgets_controller'
import { WidgetFactoryFunc } from './types'
import {
  DefaultWidgetConfig,
  makeConfig,
  WidgetConfig,
  BaseWidgetSettings,
  BaseTemplateSettings,
  BaseClassesSettings,
} from '@/widgets/config'

export type WidgetSettings = BaseWidgetSettings<BaseTemplateSettings, BaseClassesSettings>

export type ConstructorFor<T> = T extends Widget<infer SettingsType>
  ? new (almaClient: Client, settings: ResolvePreserve<SettingsType>) => T
  : never

export type SettingsFor<T> = T extends Widget<infer SettingsType>
  ? ResolvePreserve<SettingsType>
  : never

export abstract class Widget<SettingsType extends WidgetSettings> {
  private readonly _config: WidgetConfig<SettingsType>

  constructor(protected readonly almaClient: Client, settings: ResolvePreserve<SettingsType>) {
    this._config = makeConfig(this.defaultConfig(), settings)
  }

  abstract defaultConfig(): DefaultWidgetConfig<SettingsType>

  get config(): WidgetConfig<SettingsType> {
    return { ...this._config }
  }

  private get container(): HTMLElement {
    let container: HTMLElement

    if (typeof this._config.container === 'string') {
      const foundElement = document.querySelector(this._config.container)

      if (!foundElement) {
        throw new Error(`Container element '${this._config.container}' not found`)
      } else {
        container = foundElement as HTMLElement
      }
    } else {
      container = this._config.container
    }

    return container
  }

  protected abstract prepare(almaClient: Client): Promise<unknown>
  protected abstract render(
    renderingContext: unknown,
    createWidget: WidgetFactoryFunc
  ): Promise<DOMContent>

  mount(dom: DOMContent): void {
    setDOMContent(this.container, dom)
  }

  async refresh(): Promise<void> {
    const renderingContext = await this.prepare(this.almaClient)
    const nestedWidgets = new WidgetsController(this.almaClient)

    let dom: DOMContent
    const createWidget = nestedWidgets.create.bind(nestedWidgets)
    if (typeof this._config.render === 'function') {
      dom = await this._config.render(renderingContext, createWidget)
    } else {
      dom = await this.render(renderingContext, createWidget)
    }

    this.mount(dom)

    // Render any nested widget that might have been added by the rendering of the widget
    await nestedWidgets.render()
  }
}
