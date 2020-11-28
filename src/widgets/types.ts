import { ConstructorFor, SettingsFor } from './base'
import { DOMContent } from '@/types'

export interface WidgetFactoryFunc {
  <T>(widgetCtor: ConstructorFor<T>, settings: SettingsFor<T>): T
}

export interface RenderingFunc {
  (renderingContext: unknown, createWidget: WidgetFactoryFunc): Promise<DOMContent>
}
