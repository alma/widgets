import 'core-js/stable/array/from'
import './utils/polyfills'

import './main.css'

import { WidgetsController } from './widgets_controller'

import * as utils from './utils'

import { ApiMode } from './consts'
import { fetchFromApi } from './utils/fetch'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode): WidgetsController {
    /*const almaClient = await fetchFromApi(
      mode + '/v2/payments/eligibility',
      {
        purchase_amount: 20000,
      },
      {
        Authorization: `Alma-Merchant-Auth ${merchantId}`,
      },
    )*/
    return new WidgetsController({ apiMode: mode, merchantId })
  }

  //export const PaymentPlans = widgets.PaymentPlans
  //export const HowItWorks = widgets.HowItWorks
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Utils {
  export const priceToCents = utils.priceToCents
  export const priceFromCents = utils.priceFromCents
  export const formatCents = utils.formatCents
}

export { ApiMode } from './consts'
