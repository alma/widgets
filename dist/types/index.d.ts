import 'core-js/stable/array/from';
import { widgetTypes } from 'types';
import { ApiMode } from './consts';
import './main.css';
import * as utils from './utils';
import './utils/polyfills';
import { WidgetsController } from './widgets_controller';
export declare namespace Widgets {
    function initialize(merchantId: string, mode: ApiMode): WidgetsController;
    const PaymentPlans = widgetTypes.PaymentPlans;
    const Modal = widgetTypes.Modal;
}
export declare namespace Utils {
    const priceToCents: typeof utils.priceToCents;
    const priceFromCents: typeof utils.priceFromCents;
    const formatCents: typeof utils.formatCents;
}
export { ApiMode } from './consts';
