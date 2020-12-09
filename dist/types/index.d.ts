import 'core-js/stable/array/from';
import './utils/polyfills';
import './scss/main.scss';
import { ApiMode } from '@alma/client';
import { WidgetsController } from './widgets_controller';
import * as widgets from './widgets';
import * as utils from './utils';
export declare namespace Widgets {
    function initialize(merchantId: string, mode: ApiMode): WidgetsController;
    const PaymentPlans: typeof widgets.PaymentPlans;
    const HowItWorks: typeof widgets.HowItWorks;
}
export declare namespace Utils {
    const priceToCents: typeof utils.priceToCents;
    const priceFromCents: typeof utils.priceFromCents;
    const formatCents: typeof utils.formatCents;
}
export { ApiMode } from '@alma/client';
