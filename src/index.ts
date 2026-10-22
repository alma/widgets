// First import, so widgets.css keeps master's rule order.
import '@/styles/main.css'
import { ApiMode, WidgetTypes } from '@/public-api/public-api.const'
import * as utils from '@/public-api/utils'
import { WidgetsController } from '@/public-api/widgets'

export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode) {
    return WidgetsController({ domain: mode, merchantId })
  }
  export const PaymentPlans = WidgetTypes.PaymentPlans
  export const Modal = WidgetTypes.Modal
}

export namespace Utils {
  export const priceToCents = utils.priceToCents
  export const priceFromCents = utils.priceFromCents
  export const formatCents = utils.formatCents
}

export { ApiMode }
