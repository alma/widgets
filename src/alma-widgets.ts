import './scss/main.scss';

import {ApiMode} from "alma-js-client"
import WidgetsController from "./widgets_controller";

import * as widgets from './widgets'

export namespace Widgets {
  export function initialize(merchantId: string, mode: ApiMode): WidgetsController {
    return new WidgetsController(merchantId, mode);
  }

  export const PaymentPlan = widgets.PaymentPlan;
}

export {ApiMode} from "alma-js-client";
