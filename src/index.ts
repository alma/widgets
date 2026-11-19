// First import: main.css must open widgets.css, as on master.
import '@/main.css'
import * as utils from '@/public-api/alma-utils'
import { ApiMode, WidgetTypes } from '@/public-api/public-api.const'
import { WidgetsController } from '@/public-api/widgets'

// window.Alma.Widgets and window.Alma.Utils keep master's namespace shape.
// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode) {
    return WidgetsController({ domain: mode, merchantId })
  }
  export const PaymentPlans = WidgetTypes.PaymentPlans
  export const Modal = WidgetTypes.Modal
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Utils {
  export const priceToCents = utils.priceToCents
  export const priceFromCents = utils.priceFromCents
  export const formatCents = utils.formatCents
}

export { ApiMode }
