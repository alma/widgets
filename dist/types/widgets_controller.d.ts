import { ApiMode } from 'consts';
import { WidgetNames, WidgetOptions } from 'types';
declare type AddReturnType = {
    open: () => void;
    close: () => void;
} | undefined;
export declare class WidgetsController {
    private readonly apiData;
    constructor(apiData: {
        domain: ApiMode;
        merchantId: string;
    });
    add(widget: WidgetNames, options: WidgetOptions): AddReturnType;
}
export {};
