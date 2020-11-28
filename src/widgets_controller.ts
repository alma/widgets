import { Client } from '@alma/client'
import { Widget, ConstructorFor, SettingsFor } from './widgets/base'
import { WidgetSettings } from '@/widgets/config'

export class WidgetsController {
  private widgets: Widget<WidgetSettings>[] = []

  constructor(private readonly almaClient: Client) {}

  create<T>(widgetCtor: ConstructorFor<T>, settings: SettingsFor<T>): T {
    const widget = new widgetCtor(this.almaClient, settings)
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
