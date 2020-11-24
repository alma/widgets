import { DOMContent } from '@/types'
import { Client } from '@alma/client'
import { setDOMContent } from '@/utils'
import WidgetsController from '../widgets_controller'
import { RenderingFunc, WidgetFactoryFunc } from './types'

export interface WidgetConstructor {
  new <T extends Widget>(almaClient: Client, options: WidgetSettings): T
}

export interface WidgetSettings {
  // CSS selector to a single DOM element, or a DOM Element itself into which the widget must render
  container: string | HTMLElement
  // Override the rendering of a widget by providing your own rendering function.
  render?: RenderingFunc
}

type WidgetConfig = WidgetSettings

export abstract class Widget {
  protected _config: WidgetConfig
  protected readonly _almaClient: Client

  protected constructor(almaClient: Client, options: WidgetSettings) {
    this._config = options
    this._almaClient = almaClient
  }

  get config(): WidgetConfig {
    return { ...this._config }
  }

  private get container(): HTMLElement {
    let container: HTMLElement | null

    if (typeof this._config.container === 'string') {
      container = document.querySelector(this._config.container)

      if (!container) {
        throw new Error(`Container element '${this._config.container}' not found`)
      }
    } else {
      container = this._config.container
    }

    return container
  }

  async refresh(): Promise<void> {
    const renderingContext = await this.prepare(this._almaClient)
    const nestedWidgets = new WidgetsController(this._almaClient)

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

  mount(dom: DOMContent): void {
    setDOMContent(this.container, dom)
  }

  protected abstract prepare(almaClient: Client): Promise<unknown>

  protected abstract render(
    renderingContext: unknown,
    createWidget: WidgetFactoryFunc
  ): Promise<DOMContent>
}
