import { WidgetTypes } from '@/public-api/public-api.const'
import type { ApiConfig, WidgetNames, WidgetOptions } from '@/public-api/public-api.types'

export type AddReturnType =
  { open: () => void; close: (event: MouseEvent | KeyboardEvent) => void } | undefined

// Stub: add() returns the right shapes and renders nothing.
export function WidgetsController(apiData: ApiConfig) {
  return {
    add(widget: WidgetNames, options: WidgetOptions): AddReturnType {
      if (widget === WidgetTypes.Modal) {
        return { open() {}, close() {} }
      }
      return undefined
    },
  }
}
