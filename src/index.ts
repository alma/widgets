import 'core-js/stable/array/from'
import './utils/polyfills'

import './main.css'

import { WidgetsController } from './widgets_controller'

import * as utils from './utils'

import { ApiMode } from './consts'
import { widgetTypes } from 'types'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode): WidgetsController {
    return new WidgetsController({ domain: mode, merchantId })
  }
  export const PaymentPlans = widgetTypes.PaymentPlans
  export const HowItWorks = widgetTypes.HowItWorks
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Utils {
  export const priceToCents = utils.priceToCents
  export const priceFromCents = utils.priceFromCents
  export const formatCents = utils.formatCents
}

export { ApiMode } from './consts'
