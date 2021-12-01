import { ApiMode } from 'consts';
import { WidgetName, WidgetNames, WidgetOptions } from 'types';
export declare class WidgetsController {
    private readonly apiData;
    constructor(apiData: {
        domain: ApiMode;
        merchantId: string;
    });
    add<T extends WidgetNames>(widget: WidgetName<T>, options: WidgetOptions<T>): void;
}
