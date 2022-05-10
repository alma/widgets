import 'core-js/stable/array/from' // todo Looks like legacy code, needs to be tested
import { widgetTypes } from 'types'
import { ApiMode } from './consts'
import './main.css'
import * as utils from './utils'
import './utils/polyfills' // todo Looks like legacy code, needs to be tested on multiple browsers (old ones too)
import { WidgetsController } from './widgets_controller'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode): WidgetsController {
    return new WidgetsController({ domain: mode, merchantId })
  }
  export const PaymentPlans = widgetTypes.PaymentPlans
  export const Modal = widgetTypes.Modal
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Utils {
  export const priceToCents = utils.priceToCents
  export const priceFromCents = utils.priceFromCents
  export const formatCents = utils.formatCents
}

export { ApiMode } from './consts'
