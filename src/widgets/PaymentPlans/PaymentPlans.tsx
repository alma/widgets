import { Widget } from '@/widgets/Widget'
import { Client, Eligibility } from '@alma/client'
import { PaymentPlanSettings } from './types'
import { DefaultWidgetConfig, SettingsLiteral } from '@/widgets/config'
import { PaymentPlansRenderer } from '@/widgets/PaymentPlans/PaymentPlansRenderer'
import { IEligibility } from '@alma/client/dist/types/entities/eligibility'

type PaymentPlanDefaultConfig = DefaultWidgetConfig<PaymentPlanSettings>

export class PaymentPlans extends Widget<PaymentPlanSettings> {
  private results: IEligibility[]
  private loading: boolean
  private fetchError: boolean

  defaultConfig(): PaymentPlanDefaultConfig {
    return {
      purchaseAmount: 100,
      transitionDelay: 5500,
      plans: [
        {
          installmentsCount: 3,
          minAmount: 0,
          maxAmount: 200000,
        },
        {
          installmentsCount: 4,
          minAmount: 10000,
          maxAmount: 200000,
        },
      ],
      templates: {
        planSummary: null,
      },
      classes: {
        root: 'alma-paymentPlans',
      },
    }
  }

  constructor(almaClient: Client, settings: SettingsLiteral<PaymentPlanSettings>) {
    super(almaClient, settings)
    this.results = []
    this.loading = false
    this.fetchError = false
  }

  private async fetchResults() {
    // Start with an empty list of results
    const results: Array<Eligibility | number> = []

    const { purchaseAmount, plans } = this.config
    const installmentsCountsToQuery = []
    // For each plan to be queried, check whether it's worth querying (i.e. is the purchase amount
    // is within the plan's boundaries) and act accordingly
    for (const plan of plans) {
        if ((plan.minAmount == 0 || purchaseAmount >= plan.minAmount) && purchaseAmount <= plan.maxAmount) {
            installmentsCountsToQuery.push(plan.installmentsCount)
            // Push a marker into the results array to easily merge back handmade results with API ones
            results.push(installmentsCountsToQuery.length - 1)
        } else {
            // purchase amount is out of bounds: build a non-eligible result
            results.push(
                new Eligibility({
                    eligible: false,
                    installments_count: plan.installmentsCount,
                    constraints: {
                        purchase_amount: {
                            minimum: plan.minAmount,
                            maximum: plan.maxAmount,
                        },
                    },
                }),
            )
        }
    }
    // Now, query the API for plans that were valid for the requested purchase amount
    let eligibilities: IEligibility[]
    try {
      eligibilities = await this.almaClient.payments.eligibility({
        payment: {
          purchase_amount: purchaseAmount,
          installments_count: installmentsCountsToQuery,
        },
      })
    } catch (e) {
      console?.error?.(e)
      this.fetchError = true
      eligibilities = []
    }

    this.results = results
      .map((r) => (typeof r === 'number' ? eligibilities[r] : r))
      // In case of network error, eligibilities might be empty and results contain `undefined`
      // entries as a consequence, so make sure to filter them out
      .filter(Boolean)
  }

  protected async renderComponent(): Promise<JSX.Element> {
    // Compute/request results if we don't have them yet
    if (!this.results.length && !this.loading && !this.fetchError) {
      this.loading = true
      this.fetchResults().then(() => {
        this.loading = false
        this.render()
      })
    }

    const retry = () => {
      this.fetchError = false
      this.render()
    }

    const { purchaseAmount, plans, transitionDelay } = this.config
    return (
      <PaymentPlansRenderer
        almaClient={this.almaClient}
        purchaseAmount={purchaseAmount}
        queriedPlans={plans}
        results={this.results}
        transitionDelay={transitionDelay}
        error={this.fetchError}
        errorRetryCallback={retry}
      />
    )
  }
}
