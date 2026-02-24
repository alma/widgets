import type { WidgetConfig } from '../types'

export const getWidgetConfig = (): WidgetConfig | undefined => {
  return (window as any).__ALMA_WIDGET_CONFIG__
}

