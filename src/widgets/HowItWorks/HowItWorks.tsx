import { Widget } from '../Widget'
import { HowItWorksSettings } from './types'
import { IPaymentPlan } from '@alma/client/dist/types/entities/eligibility'
import { DefaultWidgetConfig, SettingsLiteral } from '@/widgets/config'
import { HowItWorksRenderer } from '@/widgets/HowItWorks/HowItWorksRenderer'
import { Client } from '@alma/client'

export class HowItWorks extends Widget<HowItWorksSettings> {
  private samplePlans: IPaymentPlan[]
  private _show: boolean

  defaultConfig(): DefaultWidgetConfig<HowItWorksSettings> {
    return {
      show: false,
      samplePurchaseAmount: 30000,

      sampleInstallmentsCounts: [3, 4],
      classes: {
        root: 'alma-howItWorks',
      },
      templates: {},
    }
  }

  constructor(almaClient: Client, settings: SettingsLiteral<HowItWorksSettings>) {
    super(almaClient, settings)
    this.samplePlans = []
    this._show = this.config.show
  }

  get show(): boolean {
    return this._show
  }

  set show(value: boolean) {
    if (this.show !== value) {
      this._show = value
      this.render()
    }
  }

  open(): void {
    this.show = true
  }

  close(): void {
    this.show = false
  }

  protected async renderComponent(): Promise<JSX.Element | null> {
    if (!this.show) return null

    return (
      <HowItWorksRenderer
        almaClient={this.almaClient}
        purchaseAmount={this.config.samplePurchaseAmount}
        installmentsCounts={this.config.sampleInstallmentsCounts}
        closeCallback={this.close}
      />
    )
  }
}
