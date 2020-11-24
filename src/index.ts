import 'core-js/stable/array/from'
import './utils/polyfills'

import './scss/main.scss'

import { ApiMode, Client } from '@alma/client'
import WidgetsController from './widgets_controller'

import * as widgets from './widgets'
import * as utils from './utils'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode): WidgetsController {
    const almaClient = Client.withMerchantId(merchantId, { mode })
    return new WidgetsController(almaClient)
  }

  export const PaymentPlan = widgets.PaymentPlan
  export const HowItWorks = widgets.HowItWorks
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Utils {
  export const priceToCents = utils.priceToCents
  export const priceFromCents = utils.priceFromCents
  export const formatCents = utils.formatCents
  export const joinInstallmentsCounts = utils.joinInstallmentsCounts
}

export { ApiMode } from '@alma/client'
