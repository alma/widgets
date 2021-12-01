import { Client } from '@alma/client';
import { ConstructorFor, SettingsFor } from './widgets/Widget';
export declare class WidgetsController {
    private readonly almaClient;
    private widgets;
    constructor(almaClient: Client);
    add<T>(widgetCtor: ConstructorFor<T>, settings: SettingsFor<T>): T;
    render(): Promise<void>;
}
