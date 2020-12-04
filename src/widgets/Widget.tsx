import { Client } from '@alma/client'
import {
  DefaultWidgetConfig,
  makeConfig,
  SettingsLiteral,
  WidgetConfig,
  WidgetSettings,
} from '@/widgets/config'
import { render } from 'preact'

export type ConstructorFor<T> = T extends Widget<infer SettingsType>
  ? new (almaClient: Client, settings: SettingsLiteral<SettingsType>) => T
  : never

export type SettingsFor<T> = T extends Widget<infer SettingsType>
  ? SettingsLiteral<SettingsType>
  : never

export abstract class Widget<SettingsType extends WidgetSettings> {
  protected readonly config: WidgetConfig<SettingsType>

  constructor(protected readonly almaClient: Client, settings: SettingsLiteral<SettingsType>) {
    this.config = makeConfig<SettingsType>(this.defaultConfig(), settings)
  }

  abstract defaultConfig(): DefaultWidgetConfig<SettingsType>

  private get container(): HTMLElement {
    let container: HTMLElement

    if (typeof this.config.container === 'string') {
      const foundElement = document.querySelector(this.config.container)

      if (!foundElement) {
        throw new Error(`Container element '${this.config.container}' not found`)
      } else {
        container = foundElement as HTMLElement
      }
    } else {
      container = this.config.container
    }

    return container
  }

  protected abstract renderComponent(): Promise<JSX.Element | null>

  async render(): Promise<void> {
    const content = await this.renderComponent()
    render(<div className="alma-widget-root">{content}</div>, this.container)
  }
}
