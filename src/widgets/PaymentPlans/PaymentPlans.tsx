import { Widget } from '@/widgets/Widget'
import { Client } from '@alma/client'
import { PaymentPlanSettings } from './types'
import { DefaultWidgetConfig, SettingsLiteral } from '@/widgets/config'
import { PaymentPlansRenderer } from '@/widgets/PaymentPlans/PaymentPlansRenderer'
import { IEligibility } from '@alma/client/dist/types/entities/eligibility'

type PaymentPlanDefaultConfig = DefaultWidgetConfig<PaymentPlanSettings>

export class PaymentPlans extends Widget<PaymentPlanSettings> {
  private results: IEligibility[]

  defaultConfig(): PaymentPlanDefaultConfig {
    return {
      purchaseAmount: 100,
      plans: [
        {
          installmentsCount: 3,
          minAmount: 10000,
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
        root: 'alma-payment_plan',
      },
    }
  }

  constructor(almaClient: Client, settings: SettingsLiteral<PaymentPlanSettings>) {
    super(almaClient, settings)
    this.results = []
  }

  protected async renderComponent(): Promise<JSX.Element | null> {
    return <PaymentPlansRenderer queriedPlans={this.config.plans} results={this.results} />
  }
}

// protected async prepare(almaClient: Client): Promise<any> {
//   const { purchaseAmount, minPurchaseAmount, maxPurchaseAmount } = this.config
//
//   if (
//     (minPurchaseAmount && purchaseAmount < minPurchaseAmount) ||
//     (maxPurchaseAmount && purchaseAmount > maxPurchaseAmount)
//   ) {
//     return [
//       {
//         eligible: false,
//         reasons: {
//           purchase_amount: 'invalid_value',
//         },
//         constraints: {
//           purchase_amount: {
//             minimum: minPurchaseAmount,
//             maximum: maxPurchaseAmount,
//           },
//         },
//       },
//     ]
//   }
//
//   return almaClient.payments.eligibility({
//     payment: {
//       purchase_amount: purchaseAmount,
//       installments_count: this.installmentsCounts,
//     },
//   })
// }

// protected async render(
//   renderingContext: any,
//   createWidget: WidgetFactoryFunc,
// ): Promise<DOMContent> {
//   const root = document.createElement('div')
//   root.className = this.config.classes.root
//
//   const eligiblePlans: EligibleEligibility[] = []
//   let minEligible: integer = Number.MAX_VALUE
//   let maxEligible: integer = Number.MIN_VALUE
//
//   for (const eligibility of renderingContext) {
//     if (eligibility.eligible) {
//       eligiblePlans.push(eligibility)
//     } else {
//       if (eligibility.reasons.purchase_amount) {
//         const min = Math.max(
//           this.config.minPurchaseAmount || 0,
//           eligibility.constraints.purchase_amount.minimum,
//         )
//         const max = Math.min(
//           this.config.maxPurchaseAmount || 0,
//           eligibility.constraints.purchase_amount.maximum,
//         )
//
//         minEligible = min < minEligible ? min : minEligible
//         maxEligible = max > maxEligible ? max : maxEligible
//       } else if (eligibility.reasons.merchant) {
//         return ''
//       }
//     }
//   }
//
//   if (eligiblePlans.length > 0) {
//     const titleRoot = document.createElement('div')
//     titleRoot.className = this.config.classes.title
//     setDOMContent(
//       titleRoot,
//       this.config.templates.title(eligiblePlans, this.config, createWidget),
//     )
//     setDOMContent(root, titleRoot)
//
//     for (const eligibility of eligiblePlans) {
//       const plan = document.createElement('div')
//       plan.className = this.config.classes.paymentPlan.root
//       setDOMContent(
//         plan,
//         this.config.templates.paymentPlan(eligibility, this.config, createWidget),
//       )
//
//       root.appendChild(plan)
//     }
//   } else {
//     const notEligibleRoot = document.createElement('div')
//     notEligibleRoot.className = this.config.classes.notEligible
//     setDOMContent(
//       notEligibleRoot,
//       this.config.templates.notEligible(
//         minEligible,
//         maxEligible,
//         this.installmentsCounts,
//         this.config,
//         createWidget,
//       ),
//     )
//
//     setDOMContent(root, notEligibleRoot)
//   }
//
//   return root
// }
