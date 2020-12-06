import { Widget } from '../Widget'
import { HowItWorksSettings } from './types'
import Eligibility, {
  EligibleEligibility,
  IPaymentPlan,
} from '@alma/client/dist/types/entities/eligibility'
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

  private async fetchSamplePlans(): Promise<IPaymentPlan[]> {
    const plans: Eligibility[] = (await this.almaClient.payments.eligibility({
      payment: {
        purchase_amount: this.config.samplePurchaseAmount,
        installments_count: this.config.sampleInstallmentsCounts,
      },
    })) as Eligibility[] // TODO: remove type assertions once @alma/client is updated

    return plans.filter((p) => p.eligible).map((p: EligibleEligibility) => p.payment_plan)
  }

  protected async renderComponent(): Promise<JSX.Element | null> {
    if (!this.show) return null

    if (!this.samplePlans.length) {
      this.fetchSamplePlans()
        .then((plans) => {
          this.samplePlans = plans
          this.render()
        })
        .catch(() => {
          return null
        })
    }

    return (
      <HowItWorksRenderer
        samplePlans={this.samplePlans}
        closeCallback={() => (this.show = false)}
      />
    )
  }
}
