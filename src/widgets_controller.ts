import { Client } from '@alma/client'
import { Widget, WidgetConstructor, WidgetSettings } from './widgets/base'

export class WidgetsController {
  private readonly almaClient: Client
  private widgets: Widget[] = []

  constructor(almaClient: Client) {
    this.almaClient = almaClient
  }

  create(widgetCtor: WidgetConstructor, options: WidgetSettings): Widget {
    const widget = new widgetCtor(this.almaClient, options)
    this.widgets.push(widget)
    return widget
  }

  async render(): Promise<void> {
    const promises: Promise<void>[] = []

    for (const widget of this.widgets) {
      promises.push(widget.refresh())
    }

    await Promise.all(promises)
  }
}

export default WidgetsController
