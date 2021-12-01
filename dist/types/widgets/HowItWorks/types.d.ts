import { integer } from '@/types';
import { BaseClassesSettings, BaseTemplateSettings, BaseWidgetSettings } from '../config';
export interface HowItWorksSettings extends BaseWidgetSettings<BaseTemplateSettings, BaseClassesSettings> {
    show?: boolean;
    samplePurchaseAmount?: integer;
    sampleInstallmentsCounts?: integer[];
}
