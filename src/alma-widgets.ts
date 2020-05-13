import 'core-js/stable/array/from';
import './utils/polyfills';

import './scss/main.scss';

import {ApiMode, Client} from "alma-js-client";
import WidgetsController from "./widgets_controller";

import * as widgets from './widgets';
import * as utils from './utils';

export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode): WidgetsController {
    let almaClient = Client.withMerchantId(merchantId, {mode});
    return new WidgetsController(almaClient);
  }

  export const PaymentPlan = widgets.PaymentPlan;
  export const HowItWorks = widgets.HowItWorks;
}

export namespace Utils {
  export const priceToCents = utils.priceToCents;
  export const priceFromCents = utils.priceFromCents;
  export const formatCents = utils.formatCents;
  export const joinInstallmentsCounts = utils.joinInstallmentsCounts;
}

export {ApiMode} from "alma-js-client";
